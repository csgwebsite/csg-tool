import { supabase } from './supabase.js';
import { updateFavicon, generateId } from '../utils/helpers.js';

const KEYS = { projects: 'projects', members: 'members', tasks: 'tasks', dataItems: 'data_items', tags: 'tags', notifications: 'notifications', currentUser: 'coctask_current_user', settings: 'coctask_settings' };

const listeners = new Set();
let emitTimeout = null;
function emit() {
    if (emitTimeout) clearTimeout(emitTimeout);
    emitTimeout = setTimeout(() => {
        listeners.forEach(fn => fn());
    }, 50);
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const memStore = new Map();
['projects', 'members', 'tasks', 'data_items', 'tags', 'notifications'].forEach(k => memStore.set(k, []));

let storageAvailable = null;
function checkStorage() {
    if (storageAvailable !== null) return storageAvailable;
    try { localStorage.setItem('__test__', '1'); localStorage.removeItem('__test__'); storageAvailable = true; }
    catch { storageAvailable = false; console.warn('localStorage blocked – using in-memory storage'); }
    return storageAvailable;
}
function loadLocal(k) {
    try {
        if (checkStorage()) {
            let d = localStorage.getItem(k);
            if (!d && k === 'coctask_current_user') d = localStorage.getItem('fes_current_user');
            if (!d && k === 'coctask_settings') d = localStorage.getItem('fes_settings');
            return d ? JSON.parse(d) : memStore.has(k) ? memStore.get(k) : null;
        }
        return memStore.has(k) ? memStore.get(k) : null;
    } catch { return memStore.has(k) ? memStore.get(k) : null; }
}
function saveLocal(k, d) {
    memStore.set(k, d);
    try { if (checkStorage()) { localStorage.setItem(k, JSON.stringify(d)); } }
    catch (e) { console.warn('Storage write failed:', k, e.message); }
}

export async function uploadImage(file, folder = 'images') {
    if (!file) return null;

    let uploadFile = file;
    // Auto compress if image is larger than 500KB
    if (file.type.startsWith('image/') && file.size > 500 * 1024) {
        try {
            uploadFile = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxDim = 1200; // Resize large images
                        if (width > maxDim || height > maxDim) {
                            if (width > height) {
                                height = Math.round((height * maxDim) / width);
                                width = maxDim;
                            } else {
                                width = Math.round((width * maxDim) / height);
                                height = maxDim;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const ext = file.name.split('.').pop();
                        canvas.toBlob((blob) => {
                            if (blob) {
                                const newName = file.name.replace(/\.[^/.]+$/, "") + (ext.toLowerCase() === 'png' ? '.png' : '.jpg');
                                const type = ext.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
                                resolve(new File([blob], newName, { type, lastModified: Date.now() }));
                            } else {
                                resolve(file);
                            }
                        }, ext.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg', 0.6); // 60% quality
                    };
                    img.onerror = () => resolve(file);
                };
                reader.onerror = () => resolve(file);
            });
        } catch (e) {
            console.error('Compression error:', e);
        }
    }

    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, uploadFile);
    if (error) {
        console.error('Upload Error:', error);
        return null;
    }
    const { data: publicData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return publicData.publicUrl;
}

async function fetchAllRows(tableName) {
    let allData = [];
    let start = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .range(start, start + limit - 1);

        if (error) {
            console.error(`Error fetching table ${tableName}:`, error);
            return { data: null, error };
        }

        if (data && data.length > 0) {
            allData = allData.concat(data);
            start += limit;
            if (data.length < limit) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }
    return { data: allData, error: null };
}

export async function initStore() {
    saveLocal(KEYS.settings, loadLocal(KEYS.settings) || { theme: 'light', sidebarCollapsed: false, customLogo: '' });

    const allTables = ['members', 'projects', 'tasks', 'notifications', 'data_items', 'tags'];

    // Fetch all tables to ensure deep links can find data synchronously
    const results = await Promise.all(allTables.map(t => {
        if (t === 'notifications') return supabase.from(t).select('*').order('createdAt', { ascending: false }).limit(500);
        return fetchAllRows(t);
    }));

    let isMembersEmpty = true;
    allTables.forEach((t, i) => {
        if (results[i].data) {
            memStore.set(t, results[i].data);
            if (t === 'members' && results[i].data.length > 0) isMembersEmpty = false;
        }
    });

    if (isMembersEmpty) {
        // Fallback for empty database (init sample data)
        const { getSampleData } = await import('./sampleData.js');
        const s = getSampleData();

        if (s.members.length > 0) await supabase.from('members').insert(s.members);
        if (s.projects.length > 0) await supabase.from('projects').insert(s.projects);
        if (s.tasks.length > 0) await supabase.from('tasks').insert(s.tasks);
        if (s.dataItems.length > 0) await supabase.from('data_items').insert(s.dataItems);
        if (s.tags.length > 0) await supabase.from('tags').insert(s.tags);

        const res = await Promise.all(allTables.map(t => {
            if (t === 'notifications') return supabase.from(t).select('*').order('createdAt', { ascending: false }).limit(500);
            return fetchAllRows(t);
        }));
        allTables.forEach((t, i) => {
            if (res[i].data) memStore.set(t, res[i].data);
        });
    }

    // Sync cloud settings
    const sys = memStore.get('data_items').find(i => i.id === 'system_settings');
    if (sys) {
        try {
            const cloud = JSON.parse(sys.description);
            const local = loadLocal(KEYS.settings);
            const merged = { ...local, ...cloud };
            saveLocal(KEYS.settings, merged);
            if (merged.customLogo) updateFavicon(merged.customLogo);
        } catch (e) { }
    } else {
        const local = getSettings();
        if (local.customLogo) updateFavicon(local.customLogo);
    }

    // Deduplicate tags logic to fix past duplicate tag issues
    const tgs = memStore.get('tags');
    if (tgs && tgs.length > 0) {
        const unique = [];
        const seen = new Set();
        const toDelete = [];
        for (const t of tgs) {
            if (!t.name) continue;
            const key = t.name.toLowerCase() + '_' + (t.type || '');
            if (seen.has(key)) {
                toDelete.push(t.id);
            } else {
                seen.add(key);
                unique.push(t);
            }
        }
        if (toDelete.length > 0) {
            memStore.set('tags', unique);
            const deleteBatch = async () => {
                for (let i = 0; i < toDelete.length; i += 50) {
                    await supabase.from('tags').delete().in('id', toDelete.slice(i, i + 50));
                }
            };
            deleteBatch();
        }
    }

    setupRealtime();
    emit();
}

function setupRealtime() {
    const tables = ['projects', 'members', 'tasks', 'data_items', 'tags', 'notifications'];
    tables.forEach(table => {
        supabase.channel('public:' + table)
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, payload => {
                const list = memStore.get(table);
                if (payload.eventType === 'INSERT') {
                    if (!list.find(item => item.id === payload.new.id)) list.push(payload.new);
                } else if (payload.eventType === 'UPDATE') {
                    const idx = list.findIndex(item => item.id === payload.new.id);
                    if (idx > -1) list[idx] = payload.new;
                } else if (payload.eventType === 'DELETE') {
                    const idx = list.findIndex(item => item.id === payload.old.id);
                    if (idx > -1) list.splice(idx, 1);
                }
                emit();
            }).subscribe();
    });
}

// Projects
export function getProjects() { return memStore.get(KEYS.projects); }
export function getProject(id) { return getProjects().find(p => p.id === id); }
export function addProject(p) {
    const a = getProjects(); a.push(p); emit();
    supabase.from(KEYS.projects).insert([p]).then(({ error }) => { if (error) console.error(error); });
}
export function updateProject(id, u) {
    const list = getProjects();
    const idx = list.findIndex(p => p.id === id);
    if (idx > -1) list[idx] = { ...list[idx], ...u };
    emit();
    supabase.from(KEYS.projects).update(u).eq('id', id).then(({ error }) => { if (error) console.error(error); });
}
export function deleteProject(id) {
    const list = memStore.get(KEYS.projects); memStore.set(KEYS.projects, list.filter(p => p.id !== id));
    emit();
    supabase.from(KEYS.projects).delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });

    // Cascading delete tasks in memory (optionally rely on triggers, but we do it manually here)
    memStore.set(KEYS.tasks, memStore.get(KEYS.tasks).filter(t => t.projectId !== id));
    supabase.from(KEYS.tasks).delete().eq('projectId', id).then();
}

// Members
export function getMembers() { return memStore.get(KEYS.members); }
export function getMember(id) {
    return getMembers().find(m => m.id === id || m.id === 'MEM' + id || m.id.replace('MEM', '') === id);
}

const MEMBER_COLS = [
    'id', 'fullName', 'phone', 'emailFE', 'emailFPT', 'gmail', 'location', 'position',
    'school', 'generation', 'cccd', 'mst', 'dob', 'startDate', 'isAdmin', 'isMaster',
    'avatar', 'tags', 'projectRoles', 'facebook', 'tiktok', 'bankName', 'bankAccount',
    'bankAccountName', 'bankBranch', 'accessHistory', 'status'
];
function filterMember(m) {
    const r = {}; MEMBER_COLS.forEach(c => { if (m.hasOwnProperty(c)) r[c] = m[c]; }); return r;
}

export function addMember(m) {
    const a = getMembers(); a.push(m); emit();
    supabase.from(KEYS.members).insert([filterMember(m)]).then(({ error }) => { if (error) console.error(error); });
}
export function updateMember(id, u) {
    const list = getMembers();
    const idx = list.findIndex(m => m.id === id);
    if (idx > -1) {
        const oldRoles = list[idx].projectRoles || {};
        list[idx] = { ...list[idx], ...u };

        const currentUser = getCurrentUser();
        if (currentUser?.id === id) {
            setCurrentUser({ ...currentUser, ...u });
        }

        // Check for new project roles to send notification
        if (u.projectRoles) {
            Object.keys(u.projectRoles).forEach(pid => {
                if (u.projectRoles[pid] && !oldRoles[pid]) {
                    const proj = getProject(pid);
                    if (proj) {
                        createNotification({
                            id: generateId(),
                            userId: id,
                            title: 'Dự án mới',
                            content: `Bạn đã được thêm vào dự án "${proj.name}" với vai trò ${u.projectRoles[pid]}`,
                            type: 'project',
                            linkId: pid,
                            isRead: false
                        });
                    }
                }
            });
        }
    }
    emit();
    supabase.from(KEYS.members).update(filterMember(u)).eq('id', id).then(({ error }) => { if (error) console.error(error); });
}
export function deleteMember(id) {
    const list = memStore.get(KEYS.members); memStore.set(KEYS.members, list.filter(m => m.id !== id));
    emit();
    supabase.from(KEYS.members).delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
}

const TASK_COLS = [
    'id', 'code', 'title', 'description', 'projectId', 'priority', 'assigneeId',
    'assignerId', 'reviewerId', 'deadline', 'status', 'tags', 'createdBy', 'createdAt', 'comments',
    'approvedBy', 'fileLink', 'usesAI', 'links'
];
function filterTask(t) {
    const r = {}; TASK_COLS.forEach(c => { if (t.hasOwnProperty(c)) r[c] = t[c]; }); return r;
}

// Tasks
export function getTasks() { return memStore.get(KEYS.tasks); }
export function getTask(id) {
    // Với task mới: id = code (ví dụ 'AYG00021'), tìm theo id là đủ.
    // Với task cũ còn dùng UUID: fallback tìm theo code.
    return getTasks().find(t => t.id === id) || getTasks().find(t => t.code === id);
}
export async function addTask(t) {
    const a = getTasks(); a.push(t); emit();
    const currentUser = getCurrentUser();
    if (t.assigneeId && t.assigneeId !== currentUser?.id) {
        createNotification({
            id: generateId(),
            userId: t.assigneeId,
            title: 'Task mới',
            content: `Bạn được giao task mới: "${t.title}"`,
            type: 'task',
            linkId: t.id,
            isRead: false
        });
    }
    // Await insert để đảm bảo record đã commit vào Supabase trước khi hàm trả về.
    // Điều này ngăn race condition: generateTaskId lần sau sẽ thấy đúng max number.
    const { error } = await supabase.from(KEYS.tasks).insert([filterTask(t)]);
    if (error) console.error('addTask insert error:', error);
}
export function updateTask(id, u) {
    const list = getTasks();
    const idx = list.findIndex(t => t.id === id);
    if (idx > -1) {
        const oldTask = list[idx];
        list[idx] = { ...oldTask, ...u };
        const currentUser = getCurrentUser();

        if (u.assigneeId && u.assigneeId !== oldTask.assigneeId && u.assigneeId !== currentUser?.id) {
            createNotification({
                id: generateId(),
                userId: u.assigneeId,
                title: 'Task được giao',
                content: `Bạn được giao task mới: "${oldTask.title}"`,
                type: 'task',
                linkId: oldTask.id,
                isRead: false
            });
        }

        if (u.status && u.status !== oldTask.status && (u.status === 'complete' || u.status === 'pending_approval')) {
            const notifyIds = new Set([oldTask.reviewerId, oldTask.createdBy, oldTask.assignerId].filter(uid => uid && uid !== currentUser?.id));
            notifyIds.forEach(uid => {
                createNotification({
                    id: generateId(),
                    userId: uid,
                    title: 'Cập nhật trạng thái Task',
                    content: `Task "${oldTask.title}" đã chuyển sang ${u.status === 'complete' ? 'Hoàn thành' : 'Chờ duyệt'}`,
                    type: 'task',
                    linkId: oldTask.id,
                    isRead: false
                });
            });
        }
    }
    emit();
    supabase.from(KEYS.tasks).update(filterTask(u)).eq('id', id).then(({ error }) => { if (error) console.error(error); });
}
export function deleteTask(id) {
    const list = memStore.get(KEYS.tasks); memStore.set(KEYS.tasks, list.filter(t => t.id !== id));
    emit();
    supabase.from(KEYS.tasks).delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
}
// Sinh một code ĐỘC NHẤT để dùng làm CẢ id lẫn code của task (giống Members: MEM001).
// Query Supabase trực tiếp theo prefix để lấy số lớn nhất hiện tại, tránh race condition.
export async function generateTaskId(projectId) {
    const proj = getProject(projectId);
    const prefix = proj?.code || 'TSK';

    // Query theo prefix (id LIKE 'CRE%') thay vì projectId, bắt được mọi task cùng prefix
    // kể cả task cũ dùng UUID hay task từ project khác cùng code.
    const { data: remoteData, error } = await supabase
        .from('tasks')
        .select('id, code')
        .like('id', `${prefix}%`);

    const sourceList = (remoteData && !error)
        ? remoteData
        : getTasks().filter(t => (t.id || '').startsWith(prefix) || (t.code || '').startsWith(prefix));

    // Quét cả id lẫn code để lấy số lớn nhất (tương thích task cũ)
    const nums = sourceList.flatMap(t => [
        t.id?.startsWith(prefix) ? (parseInt(t.id.slice(prefix.length), 10) || 0) : 0,
        t.code?.startsWith(prefix) ? (parseInt(t.code.slice(prefix.length), 10) || 0) : 0,
    ]);
    const next = (Math.max(0, ...nums) + 1).toString().padStart(5, '0');
    return prefix + next;
}

// Giữ alias cũ để không cần sửa nơi khác đang dùng generateTaskCode
export const generateTaskCode = generateTaskId;

// Data Items
export function getDataItems() { return memStore.get(KEYS.dataItems); }
export function addDataItem(i) {
    const a = getDataItems(); a.push(i); emit();
    supabase.from(KEYS.dataItems).insert([i]).then(({ error }) => { if (error) console.error(error); });
}
export function updateDataItem(id, u) {
    const list = getDataItems();
    const idx = list.findIndex(i => i.id === id);
    if (idx > -1) list[idx] = { ...list[idx], ...u };
    emit();
    supabase.from(KEYS.dataItems).update(u).eq('id', id).then(({ error }) => { if (error) console.error(error); });
}
export function deleteDataItem(id) {
    const list = memStore.get(KEYS.dataItems); memStore.set(KEYS.dataItems, list.filter(i => i.id !== id));
    emit();
    supabase.from(KEYS.dataItems).delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
}

// Milestones (stored in data_items with category='milestone')
export function getMilestones() { return getDataItems().filter(i => i.category === 'milestone'); }
export function addMilestone(m) { addDataItem({ ...m, category: 'milestone' }); }
export function deleteMilestone(id) { deleteDataItem(id); }

// Tags
export function getTags() { return memStore.get(KEYS.tags); }
export function addTag(t) {
    const a = getTags(); a.push(t); emit();
    supabase.from(KEYS.tags).insert([t]).then(({ error }) => { if (error) console.error(error); });
}
export function updateTag(id, u) {
    const list = getTags();
    const idx = list.findIndex(t => t.id === id);
    if (idx > -1) list[idx] = { ...list[idx], ...u };
    emit();
    supabase.from(KEYS.tags).update(u).eq('id', id).then(({ error }) => { if (error) console.error(error); });
}
export function deleteTag(id) {
    const list = memStore.get(KEYS.tags); memStore.set(KEYS.tags, list.filter(t => t.id !== id));
    emit();
    supabase.from(KEYS.tags).delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
}

// Settings
export function getSettings() { return loadLocal(KEYS.settings) || { theme: 'light', sidebarCollapsed: false, customLogo: '' }; }
export function updateSettings(u) {
    const s = { ...getSettings(), ...u };
    saveLocal(KEYS.settings, s);

    if (u.customLogo !== undefined) {
        updateFavicon(u.customLogo);
        if (isAdmin()) {
            const item = {
                id: 'system_settings',
                category: 'system',
                title: 'System Configuration',
                description: JSON.stringify({ customLogo: s.customLogo }),
                link: '#'
            };
            const list = memStore.get(KEYS.dataItems);
            if (list.find(i => i.id === 'system_settings')) {
                supabase.from(KEYS.dataItems).update(item).eq('id', 'system_settings').then();
            } else {
                supabase.from(KEYS.dataItems).insert([item]).then();
                list.push(item);
            }
        }
    }

    emit();
    return s;
}

// Current User
export function getCurrentUser() { return loadLocal(KEYS.currentUser); }
export function setCurrentUser(u) { saveLocal(KEYS.currentUser, u); emit(); }
export function isAdmin() { const u = getCurrentUser(); return u?.isAdmin === true || u?.isMaster === true; }
export function isMaster() { return getCurrentUser()?.isMaster === true; }
export async function logout() {
    try { await supabase.auth.signOut(); } catch (e) { console.error('Logout error', e); }
    memStore.delete(KEYS.currentUser);
    try { localStorage.removeItem(KEYS.currentUser); } catch { }
    emit();
}

// Reset
export function resetAllData() {
    Object.values(KEYS).forEach(k => { memStore.delete(k); try { localStorage.removeItem(k); } catch { } });
    window.location.reload();
}

// Notifications
export function getNotifications() {
    return (memStore.get(KEYS.notifications) || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function getMyNotifications() {
    const user = getCurrentUser();
    if (!user) return [];
    return getNotifications().filter(n => n.userId === user.id);
}
export function createNotification(n) {
    if (!n.userId) return;
    const a = memStore.get(KEYS.notifications) || []; a.push(n); emit();
    supabase.from(KEYS.notifications).insert([n]).then(({ error }) => { if (error) console.error(error); });
}
export function markAsRead(id) {
    const list = memStore.get(KEYS.notifications) || [];
    const idx = list.findIndex(n => n.id === id);
    if (idx > -1) { list[idx] = { ...list[idx], isRead: true }; emit(); }
    supabase.from(KEYS.notifications).update({ isRead: true }).eq('id', id).then();
}
export function markAllAsRead() {
    const user = getCurrentUser();
    if (!user) return;
    const list = memStore.get(KEYS.notifications) || [];
    let updated = false;
    list.forEach(n => {
        if (n.userId === user.id && !n.isRead) { n.isRead = true; updated = true; }
    });
    if (updated) emit();
    supabase.from(KEYS.notifications).update({ isRead: true }).eq('userId', user.id).eq('isRead', false).then();
}
