import React, { useState } from 'react';
import { useLMS } from '../context';
import { Assignment, Question } from '../types';
import { Header, Drawer, Card, Button, Input, Badge } from '../components/UI';
import { FileText, CheckCircle, Clock, BookOpen, PenTool, UploadCloud, LogOut, User as UserIcon, ChevronLeft, Camera, ExternalLink, CheckSquare } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, assignments, submissions, resources, announcements, logout, updateUserBio, updateUserAvatar, addSubmission } = useLMS();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assignments' | 'resources'>('dashboard');
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  
  // Assignment Taking State
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  if (!currentUser) return null;

  const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
  const myAssignments = assignments.filter(a => a.targetClass === 'All' || a.targetClass === currentUser.className);
  
  const pendingAssignments = myAssignments.filter(a => !mySubmissions.find(s => s.assignmentId === a.id));
  const completedAssignments = myAssignments.filter(a => mySubmissions.find(s => s.assignmentId === a.id));

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

  const handleSubmit = () => {
    if (!viewAssignment) return;

    // Simulate file upload by just using name
    const fileUrl = uploadFile ? `fake_path/${uploadFile.name}` : undefined;

    addSubmission({
      id: `sub-${Date.now()}`,
      assignmentId: viewAssignment.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      className: currentUser.className!,
      answers: answers, // Empty if manual
      fileUrl,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    });

    setViewAssignment(null);
    setAnswers({});
    setUploadFile(null);
    alert("Tugas berhasil dikirim!");
  };

  const renderAssignmentContent = () => {
    if (!viewAssignment) return null;

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => setViewAssignment(null)}>← Kembali</Button>
            <h2 className="text-2xl font-bold">{viewAssignment.title}</h2>
          </div>

          <Card className="mb-6">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide mb-2">Instruksi</h3>
            <p className="text-gray-800 whitespace-pre-line">{viewAssignment.description}</p>
          </Card>

          <div className="space-y-6">
            {viewAssignment.type === 'manual' && (
                <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <CheckSquare className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-gray-600 mb-6">Tugas ini dikerjakan secara offline atau manual. Jika Anda sudah menyelesaikannya sesuai instruksi guru, silakan klik tombol di bawah.</p>
                </div>
            )}

            {viewAssignment.type === 'upload' && (
              <Card>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Pekerjaan</label>
                 <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                      onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                      <span className="text-blue-600 font-medium">Klik untuk upload</span>
                      <span className="text-xs text-gray-500 mt-1">{uploadFile ? uploadFile.name : 'PDF, JPG, atau PNG'}</span>
                    </label>
                 </div>
              </Card>
            )}

            {viewAssignment.questions.map((q: Question, idx: number) => (
               <Card key={q.id}>
                 <p className="font-medium text-lg mb-4">{idx + 1}. {q.text}</p>
                 {viewAssignment.type === 'multiple_choice' && (
                   <div className="space-y-3">
                     {q.options?.map((opt, i) => (
                       <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50">
                         <input 
                            type="radio" 
                            name={q.id} 
                            value={opt}
                            onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                            className="w-5 h-5 text-black focus:ring-black"
                         />
                         <span>{opt}</span>
                       </label>
                     ))}
                   </div>
                 )}
                 {viewAssignment.type === 'essay' && (
                   <textarea 
                      className="w-full border border-gray-200 rounded-xl p-4 h-32 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      placeholder="Tulis jawabanmu di sini..."
                      onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                   ></textarea>
                 )}
               </Card>
            ))}

            <Button className="w-full mt-8" onClick={handleSubmit}>
                {viewAssignment.type === 'manual' ? 'Tandai Sudah Selesai' : 'Kirim Tugas'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {viewAssignment && renderAssignmentContent()}
      
      <Header 
        title="Dashboard Siswa" 
        subtitle={`${currentUser.name} — ${currentUser.className}`} 
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
            <p className="text-gray-500">{currentUser.className}</p>
          </div>
          
          <nav className="space-y-2 flex-1">
            <Button variant={activeTab === 'dashboard' ? 'primary' : 'ghost'} className="w-full justify-start text-left" onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}>Dashboard</Button>
            <Button variant={activeTab === 'assignments' ? 'primary' : 'ghost'} className="w-full justify-start text-left" onClick={() => { setActiveTab('assignments'); setIsMenuOpen(false); }}>Tugas Saya</Button>
            <Button variant={activeTab === 'resources' ? 'primary' : 'ghost'} className="w-full justify-start text-left" onClick={() => { setActiveTab('resources'); setIsMenuOpen(false); }}>Bahan Bacaan</Button>
          </nav>

          <div className="pt-4 border-t border-gray-100">
             <Button variant="danger" className="w-full flex items-center justify-center gap-2" onClick={logout}>
                <LogOut className="w-4 h-4" /> Keluar
             </Button>
          </div>
        </div>
      </Drawer>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Bio Section */}
        {activeTab === 'dashboard' && (
            <>
                <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Halo, {currentUser.name.split(' ')[0]}</h2>
                            <p className="opacity-80 italic">"{currentUser.bio}"</p>
                        </div>
                        <Button variant="secondary" className="text-xs py-2 px-3 bg-white/20 text-white hover:bg-white/30 backdrop-blur" onClick={() => {
                            const newBio = prompt("Edit Bio:", currentUser.bio);
                            if (newBio) updateUserBio(newBio);
                        }}>Edit Bio</Button>
                    </div>
                </Card>

                {/* Announcements */}
                <section>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5"/> Pengumuman</h3>
                    <div className="space-y-4">
                        {announcements.filter(a => a.targetClass === 'All' || a.targetClass === currentUser.className).map(ann => (
                            <Card key={ann.id} className="border-l-4 border-l-blue-500">
                                <h4 className="font-bold text-lg">{ann.title}</h4>
                                <p className="text-gray-600 mt-1">{ann.content}</p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                    <span>{ann.authorName}</span> • <span>{new Date(ann.date).toLocaleDateString()}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="flex flex-col items-center justify-center p-4">
                        <span className="text-4xl font-bold text-blue-600">{pendingAssignments.length}</span>
                        <span className="text-sm text-gray-500 mt-1">Tugas Belum</span>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-4">
                         <span className="text-4xl font-bold text-green-600">{completedAssignments.length}</span>
                        <span className="text-sm text-gray-500 mt-1">Tugas Selesai</span>
                    </Card>
                </div>
            </>
        )}

        {/* Assignments Tab */}
        {(activeTab === 'assignments' || activeTab === 'dashboard') && (
            <section>
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold flex items-center gap-2"><PenTool className="w-5 h-5"/> Daftar Tugas</h3>
                     {activeTab === 'dashboard' && <Button variant="ghost" className="text-sm" onClick={() => setActiveTab('assignments')}>Lihat Semua</Button>}
                </div>
               
                <div className="space-y-2">
                    {/* Pending */}
                    {pendingAssignments.length > 0 && <h4 className="text-sm font-semibold text-gray-500 uppercase mt-4 mb-2">Belum Dikerjakan</h4>}
                    {pendingAssignments.map(a => (
                        <Card key={a.id} className="flex justify-between items-center hover:bg-gray-50 cursor-pointer transition" onClick={() => setViewAssignment(a)}>
                            <div>
                                <h4 className="font-semibold">{a.title}</h4>
                                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                    <Badge color="yellow">Pending</Badge>
                                    <span>Tenggat: {a.dueDate}</span>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-300" />
                        </Card>
                    ))}

                    {/* Completed */}
                    {(activeTab === 'assignments' || pendingAssignments.length === 0) && (
                        <>
                             {completedAssignments.length > 0 && <h4 className="text-sm font-semibold text-gray-500 uppercase mt-6 mb-2">Sudah Dikerjakan</h4>}
                             {completedAssignments.map(a => {
                                 const sub = mySubmissions.find(s => s.assignmentId === a.id);
                                 return (
                                     <Card key={a.id} className="flex justify-between items-center opacity-75">
                                         <div>
                                             <h4 className="font-semibold line-through text-gray-500">{a.title}</h4>
                                             <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                 {sub?.status === 'graded' ? (
                                                     <Badge color="green">Nilai: {sub.grade}/100</Badge>
                                                 ) : (
                                                     <Badge color="gray">Menunggu Dinilai</Badge>
                                                 )}
                                                 <span>Diserahkan: {new Date(sub!.submittedAt).toLocaleDateString()}</span>
                                             </div>
                                         </div>
                                         {sub?.status === 'graded' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                     </Card>
                                 );
                             })}
                        </>
                    )}
                </div>
            </section>
        )}

        {/* Resources Tab */}
        {(activeTab === 'resources' || activeTab === 'dashboard') && (
             <section>
                 <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5"/> Sumber Bacaan</h3>
                     {activeTab === 'dashboard' && <Button variant="ghost" className="text-sm" onClick={() => setActiveTab('resources')}>Lihat Semua</Button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map(res => (
                        <Card key={res.id} className="hover:border-blue-200 transition group cursor-pointer" onClick={() => {
                            if (res.type === 'link') {
                                window.open(res.content, '_blank');
                            } else {
                                alert(`Simulasi membuka file: ${res.content}`);
                            }
                        }}>
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition">
                                    {res.type === 'link' ? <ExternalLink className="w-6 h-6 text-gray-600 group-hover:text-blue-600" /> : <FileText className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 line-clamp-1">{res.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{res.type.toUpperCase()} • {res.uploadedBy}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
             </section>
        )}

      </main>
    </div>
  );
};