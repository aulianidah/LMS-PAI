import React, { useState } from 'react';
import { useLMS } from '../context';
import { Assignment, ClassName, Question, AssignmentType, Announcement, Resource } from '../types';
import { Header, Drawer, Card, Button, Input, Select, Badge } from '../components/UI';
import { Plus, Users, Book, FileText, CheckSquare, BarChart, X, Trash2, Camera, LogOut, Link as LinkIcon, Settings } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { currentUser, users, assignments, submissions, resources, announcements, logout, addAssignment, addAnnouncement, addResource, gradeSubmission, registerStudent, updateUserBio, updateUserAvatar, deleteUser, updateTeacherCredentials } = useLMS();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'grading'>('overview');
  
  // Modals/Forms State
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditCreds, setShowEditCreds] = useState(false);
  const [gradingClass, setGradingClass] = useState<ClassName>('7A');

  // Resource State
  const [resourceMode, setResourceMode] = useState<'file' | 'link'>('file');

  // New Assignment State
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({ type: 'essay', questions: [], targetClass: 'All' });
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  
  // Grading State
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState<number>(0);
  const [feedbackValue, setFeedbackValue] = useState('');

  // Credential Edit State
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  if (!currentUser) return null;

  const students = users.filter(u => u.role === 'student');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateUserAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleUpdateCreds = () => {
    if (!editUsername) return alert("Username tidak boleh kosong");
    updateTeacherCredentials(editUsername, editPassword || undefined);
    setShowEditCreds(false);
    alert("Kredensial berhasil diperbarui.");
  };

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.dueDate) return alert("Mohon lengkapi judul dan tenggat waktu.");
    
    addAssignment({
      id: `asn-${Date.now()}`,
      title: newAssignment.title!,
      description: newAssignment.description || '',
      type: newAssignment.type as AssignmentType,
      targetClass: newAssignment.targetClass as ClassName | 'All',
      dueDate: newAssignment.dueDate!,
      questions: newAssignment.questions || []
    });
    setShowAddAssignment(false);
    setNewAssignment({ type: 'essay', questions: [], targetClass: 'All' });
  };

  const addQuestion = () => {
    if (!currentQuestionText) return;
    const q: Question = { id: `q-${Date.now()}`, text: currentQuestionText };
    setNewAssignment({ ...newAssignment, questions: [...(newAssignment.questions || []), q] });
    setCurrentQuestionText('');
  };

  const handleGrade = () => {
      if(selectedSubmissionId) {
          gradeSubmission(selectedSubmissionId, gradeValue, feedbackValue);
          setSelectedSubmissionId(null);
      }
  };

  const renderAddAssignmentModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Buat Penugasan Baru</h2>
          <button onClick={() => setShowAddAssignment(false)}><X className="w-6 h-6" /></button>
        </div>
        
        <div className="space-y-4">
          <Input placeholder="Judul Tugas" onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} />
          <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="Deskripsi / Instruksi" onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
             <Select value={newAssignment.type} onChange={e => setNewAssignment({...newAssignment, type: e.target.value as AssignmentType})}>
                <option value="essay">Esai</option>
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="upload">Upload Gambar/File</option>
                <option value="manual">Tugas Offline / Manual</option>
             </Select>
             <Select value={newAssignment.targetClass} onChange={e => setNewAssignment({...newAssignment, targetClass: e.target.value as any})}>
                <option value="All">Semua Kelas</option>
                <option value="7A">7A</option>
                <option value="7B">7B</option>
                <option value="7C">7C</option>
                <option value="7D">7D</option>
                <option value="7E">7E</option>
                <option value="7F">7F</option>
             </Select>
          </div>
          
          <Input type="date" onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} />

          {/* Question Builder */}
          {newAssignment.type !== 'manual' && newAssignment.type !== 'upload' && (
            <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Pertanyaan</h3>
                {newAssignment.questions?.map((q, i) => (
                    <div key={q.id} className="flex justify-between bg-gray-50 p-2 rounded mb-2">
                        <span>{i+1}. {q.text}</span>
                    </div>
                ))}
                <div className="flex gap-2">
                    <Input placeholder="Tulis pertanyaan..." value={currentQuestionText} onChange={e => setCurrentQuestionText(e.target.value)} />
                    <Button onClick={addQuestion}>Tambah</Button>
                </div>
            </div>
          )}

          <Button className="w-full mt-4" onClick={handleCreateAssignment}>Terbitkan Tugas</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {showAddAssignment && renderAddAssignmentModal()}

      {/* Settings Modal */}
      {showEditCreds && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Pengaturan Akun</h3>
                    <button onClick={() => setShowEditCreds(false)}><X className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-500">Username</label>
                        <Input value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="Username" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Password Baru (Opsional)</label>
                        <Input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Biarkan kosong jika tidak ingin mengubah" />
                    </div>
                    <Button className="w-full" onClick={handleUpdateCreds}>Simpan Perubahan</Button>
                </div>
            </Card>
        </div>
      )}

      <Header 
        title="Dashboard Guru" 
        subtitle="Admin Panel" 
        onMenuClick={() => setIsMenuOpen(true)}
        avatarUrl={currentUser.avatar}
        onLogout={logout}
      />
      
      <Drawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
         <div className="flex flex-col h-full">
             <div className="mb-8 text-center">
                 <div className="relative w-24 h-24 mx-auto mb-3 group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg">
                        <img 
                            src={currentUser.avatar || `https://picsum.photos/seed/${currentUser.id}/200`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarChange} />
                </div>
                 <h3 className="font-bold text-lg">{currentUser.name}</h3>
                 <p className="text-gray-500 text-sm">Teacher Dashboard</p>
                 <Button variant="secondary" className="mt-4 py-2 px-4 text-xs w-full" onClick={() => {
                     setEditUsername(currentUser.username || '');
                     setEditPassword('');
                     setShowEditCreds(true);
                     setIsMenuOpen(false);
                 }}>
                    <Settings className="w-3 h-3 inline mr-2"/> Pengaturan Akun
                 </Button>
             </div>
             <nav className="space-y-2 flex-1">
                <Button variant={activeTab === 'overview' ? 'primary' : 'ghost'} className="w-full justify-start text-left" onClick={() => {setActiveTab('overview'); setIsMenuOpen(false);}}>Overview</Button>
                <Button variant={activeTab === 'assignments' ? 'primary' : 'ghost'} className="w-full justify-start text-left" onClick={() => {setActiveTab('assignments'); setIsMenuOpen(false);}}>Manajemen Tugas</Button>
                <Button variant={activeTab === 'grading' ? 'primary' : 'ghost'} className="w-full justify-start text-left" onClick={() => {setActiveTab('grading'); setIsMenuOpen(false);}}>Penilaian</Button>
                <Button variant={activeTab === 'students' ? 'primary' : 'ghost'} className="w-full justify-start text-left" onClick={() => {setActiveTab('students'); setIsMenuOpen(false);}}>Data Siswa</Button>
             </nav>
             <div className="pt-4 border-t border-gray-100">
                <Button variant="danger" className="w-full flex items-center justify-center gap-2" onClick={logout}>
                    <LogOut className="w-4 h-4" /> Keluar
                </Button>
             </div>
         </div>
      </Drawer>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="flex flex-col justify-between">
                        <h3 className="text-gray-500 font-medium">Total Siswa</h3>
                        <p className="text-4xl font-bold mt-2">{students.length}</p>
                    </Card>
                    <Card className="flex flex-col justify-between">
                        <h3 className="text-gray-500 font-medium">Tugas Aktif</h3>
                        <p className="text-4xl font-bold mt-2">{assignments.length}</p>
                    </Card>
                    <Card className="flex flex-col justify-between">
                         <h3 className="text-gray-500 font-medium">Perlu Dinilai</h3>
                         <p className="text-4xl font-bold mt-2 text-blue-600">{submissions.filter(s => s.status === 'submitted').length}</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Announcement Creator */}
                    <Card>
                        <h3 className="font-bold text-lg mb-4">Buat Pengumuman</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            addAnnouncement({
                                id: `ann-${Date.now()}`,
                                title: (form.elements.namedItem('title') as HTMLInputElement).value,
                                content: (form.elements.namedItem('content') as HTMLTextAreaElement).value,
                                targetClass: (form.elements.namedItem('target') as HTMLSelectElement).value as any,
                                date: new Date().toISOString(),
                                authorName: currentUser.name
                            });
                            form.reset();
                            alert('Pengumuman terkirim!');
                        }} className="space-y-4">
                            <Input name="title" placeholder="Judul Pengumuman" required />
                            <textarea name="content" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="Isi pesan..." required />
                            <Select name="target">
                                <option value="All">Semua Kelas</option>
                                <option value="7A">7A</option>
                                <option value="7B">7B</option>
                            </Select>
                            <Button type="submit">Kirim</Button>
                        </form>
                    </Card>

                    {/* Resource Upload */}
                    <Card>
                        <h3 className="font-bold text-lg mb-4">Upload / Tambah Bacaan</h3>
                        <div className="flex gap-2 mb-4">
                            <Button variant={resourceMode === 'file' ? 'primary' : 'ghost'} onClick={() => setResourceMode('file')} className="flex-1 text-sm py-2">Upload File</Button>
                            <Button variant={resourceMode === 'link' ? 'primary' : 'ghost'} onClick={() => setResourceMode('link')} className="flex-1 text-sm py-2">Link Website</Button>
                        </div>
                         <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                            
                            let content = '';
                            if (resourceMode === 'file') {
                                const fileInput = form.elements.namedItem('file') as HTMLInputElement;
                                if (fileInput.files && fileInput.files[0]) {
                                    content = fileInput.files[0].name; // Simulating upload
                                }
                            } else {
                                content = (form.elements.namedItem('link') as HTMLInputElement).value;
                            }

                            if (content) {
                                addResource({
                                    id: `res-${Date.now()}`,
                                    title,
                                    type: resourceMode === 'file' ? 'pdf' : 'link',
                                    content, 
                                    uploadedBy: currentUser.name,
                                    date: new Date().toISOString()
                                });
                                form.reset();
                                alert('Bahan bacaan ditambahkan!');
                            }
                        }} className="space-y-4">
                            <Input name="title" placeholder="Judul Materi" required />
                            {resourceMode === 'file' ? (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                                    <Input type="file" name="file" className="border-none bg-transparent" required />
                                </div>
                            ) : (
                                <Input name="link" placeholder="https://example.com/materi" required />
                            )}
                            <Button type="submit" variant="secondary">Tambah Resource</Button>
                        </form>
                    </Card>
                </div>
            </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Daftar Tugas</h2>
                    <Button onClick={() => setShowAddAssignment(true)} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Buat Tugas</Button>
                </div>
                <div className="grid gap-4">
                    {assignments.map(a => (
                        <Card key={a.id} className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg">{a.title}</h4>
                                <div className="text-sm text-gray-500 mt-1">
                                    <Badge>{a.targetClass}</Badge> <span className="mx-2">•</span> {a.type.replace('_', ' ').toUpperCase()} <span className="mx-2">•</span> Due: {a.dueDate}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{submissions.filter(s => s.assignmentId === a.id).length}</p>
                                <p className="text-xs text-gray-400">Submissions</p>
                            </div>
                        </Card>
                    ))}
                    {assignments.length === 0 && <p className="text-center text-gray-400 py-10">Belum ada tugas yang dibuat.</p>}
                </div>
            </div>
        )}

        {/* GRADING TAB */}
        {activeTab === 'grading' && (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Penilaian</h2>
                    <div className="w-48">
                        <Select value={gradingClass} onChange={(e) => setGradingClass(e.target.value as ClassName)}>
                            {['7A', '7B', '7C', '7D', '7E', '7F'].map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Siswa</th>
                                <th className="p-4 font-semibold text-gray-600">Tugas</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Nilai</th>
                                <th className="p-4 font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.filter(s => s.className === gradingClass).map(sub => {
                                const assign = assignments.find(a => a.id === sub.assignmentId);
                                return (
                                    <tr key={sub.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-medium">{sub.studentName}</td>
                                        <td className="p-4 text-gray-600">{assign?.title}</td>
                                        <td className="p-4">
                                            {sub.status === 'graded' 
                                                ? <Badge color="green">Sudah Dinilai</Badge> 
                                                : <Badge color="yellow">Perlu Dinilai</Badge>}
                                        </td>
                                        <td className="p-4 font-bold">{sub.grade || '-'}</td>
                                        <td className="p-4">
                                            <Button variant="secondary" className="text-xs py-2 px-3" onClick={() => {
                                                setSelectedSubmissionId(sub.id);
                                                setGradeValue(sub.grade || 0);
                                                setFeedbackValue(sub.feedback || '');
                                            }}>Nilai</Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {submissions.filter(s => s.className === gradingClass).length === 0 && (
                        <div className="p-8 text-center text-gray-400">Belum ada pengumpulan tugas dari kelas ini.</div>
                    )}
                </div>
            </div>
        )}

        {/* Grading Modal */}
        {selectedSubmissionId && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <h3 className="font-bold text-xl mb-4">Input Nilai</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Jawaban Siswa</label>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-40 overflow-y-auto mt-1 border border-gray-200">
                                {(() => {
                                    const sub = submissions.find(s => s.id === selectedSubmissionId);
                                    if (!sub) return null;
                                    const asn = assignments.find(a => a.id === sub.assignmentId);
                                    
                                    if (asn?.type === 'manual') {
                                        return <p className="text-gray-500 italic">Tugas Manual - Siswa menandai selesai.</p>
                                    }

                                    return (
                                        <>
                                            <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(sub.answers, null, 2)}</pre>
                                            {sub.fileUrl && (
                                                <div className="mt-2 font-medium text-blue-600">File: {sub.fileUrl}</div>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                        <Input type="number" placeholder="Nilai (0-100)" value={gradeValue} onChange={e => setGradeValue(Number(e.target.value))} />
                        <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="Feedback untuk siswa..." value={feedbackValue} onChange={e => setFeedbackValue(e.target.value)} />
                        <div className="flex gap-2">
                             <Button onClick={handleGrade} className="flex-1">Simpan Nilai</Button>
                             <Button variant="ghost" onClick={() => setSelectedSubmissionId(null)}>Batal</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Data Siswa</h2>
                    <Button onClick={() => setShowAddStudent(true)} className="flex items-center gap-2"><Plus className="w-4 h-4"/> Tambah Siswa</Button>
                </div>
                
                {showAddStudent && (
                    <Card className="mb-6 bg-blue-50 border-blue-100">
                        <h4 className="font-bold mb-4">Input Data Siswa (Bulk)</h4>
                        <p className="text-xs text-gray-500 mb-2">Masukkan nama siswa, pisahkan dengan ENTER untuk input banyak sekaligus.</p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const namesRaw = (form.elements.namedItem('names') as HTMLTextAreaElement).value;
                            const cls = (form.elements.namedItem('class') as HTMLSelectElement).value as ClassName;
                            
                            // Bulk Logic
                            const names = namesRaw.split('\n').map(n => n.trim()).filter(n => n !== '');
                            if (names.length > 0) {
                                names.forEach(name => registerStudent(name, cls));
                                alert(`Berhasil menambahkan ${names.length} siswa ke kelas ${cls}`);
                                form.reset();
                                setShowAddStudent(false);
                            } else {
                                alert("Mohon masukkan minimal satu nama.");
                            }
                        }} className="space-y-4">
                            <textarea 
                                name="names" 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 h-32 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                placeholder="Mike Wheeler&#10;Dustin Henderson&#10;Lucas Sinclair" 
                                required 
                            />
                            <div className="flex gap-4 items-center">
                                <div className="w-48">
                                    <Select name="class">
                                        {['7A', '7B', '7C', '7D', '7E', '7F'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </Select>
                                </div>
                                <Button type="submit">Simpan Semua</Button>
                                <Button type="button" variant="ghost" onClick={() => setShowAddStudent(false)}>Batal</Button>
                            </div>
                        </form>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map(s => (
                        <Card key={s.id} className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={s.avatar || `https://picsum.photos/seed/${s.id}/100`} alt={s.name} className="w-full h-full object-cover"/>
                                </div>
                                <div>
                                    <h4 className="font-bold">{s.name}</h4>
                                    <Badge>{s.className}</Badge>
                                </div>
                             </div>
                             <Button variant="danger" className="p-2 h-10 w-10 flex items-center justify-center rounded-full" onClick={() => {
                                 if(confirm(`Yakin ingin menghapus ${s.name}?`)) deleteUser(s.id);
                             }}>
                                <Trash2 className="w-4 h-4" />
                             </Button>
                        </Card>
                    ))}
                </div>
             </div>
        )}

      </main>
    </div>
  );
};