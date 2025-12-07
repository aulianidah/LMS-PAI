import React, { useState } from 'react';
import { useLMS } from '../context';
import { Button, Input, Select, Card } from '../components/UI';
import { ClassName } from '../types';
import { AlertCircle } from 'lucide-react';

export const Landing: React.FC = () => {
  const { users, login } = useLMS();
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  
  // Student Form
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState<ClassName>('7A');

  // Teacher Form
  const [teacherUser, setTeacherUser] = useState('');
  const [teacherPass, setTeacherPass] = useState('');

  // Error State
  const [error, setError] = useState<string | null>(null);

  const handleStudentLogin = () => {
    // Basic strict match with trim and lowercase handling
    const nameToFind = studentName.trim().toLowerCase();
    
    const found = users.find(u => 
        u.role === 'student' && 
        u.name.toLowerCase() === nameToFind && 
        u.className === studentClass
    );

    if (found) {
      setError(null);
      login(found);
    } else {
       setError("Siswa tidak ditemukan. Periksa ejaan Nama dan Kelas.");
    }
  };

  const handleTeacherLogin = () => {
    const found = users.find(u => u.role === 'teacher' && u.username === teacherUser && u.password === teacherPass);
    if (found) {
      setError(null);
      login(found);
    } else {
      setError("Username atau Password salah.");
    }
  };

  const clearError = () => {
      if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 w-full max-w-4xl px-6">
            {!role ? (
                <div className="text-center space-y-12 animate-fade-in-up">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                            Hawkins Learning Lab
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed italic">
                            “Di ruangan ini, setiap tantangan bukan untuk menakutkanmu—tapi untuk membuktikan betapa kuatnya kamu. 
                            Belajar mungkin terasa gelap kadang-kadang, tapi ingat… cahaya selalu muncul bagi mereka yang terus melangkah.”
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
                         <button 
                            onClick={() => { setRole('teacher'); setError(null); }}
                            className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-300 text-left"
                         >
                             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition rounded-3xl" />
                             <h3 className="text-2xl font-bold mb-2">Guru</h3>
                             <p className="text-gray-400 text-sm">Masuk untuk mengelola kelas dan nilai.</p>
                         </button>

                         <button 
                            onClick={() => { setRole('student'); setError(null); }}
                            className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-300 text-left"
                         >
                             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition rounded-3xl" />
                             <h3 className="text-2xl font-bold mb-2">Siswa</h3>
                             <p className="text-gray-400 text-sm">Masuk untuk mengerjakan tugas.</p>
                         </button>
                    </div>
                </div>
            ) : (
                <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-xl text-black shadow-2xl">
                     <div className="text-center mb-8">
                         <h2 className="text-2xl font-bold">Login {role === 'teacher' ? 'Guru' : 'Siswa'}</h2>
                         <p className="text-gray-500 text-sm mt-1">Silakan masukkan kredensial Anda.</p>
                     </div>

                     <div className="space-y-4">
                         {role === 'teacher' ? (
                             <>
                                <Input 
                                    placeholder="Username" 
                                    value={teacherUser} 
                                    onChange={e => { setTeacherUser(e.target.value); clearError(); }} 
                                    className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : ''}
                                />
                                <Input 
                                    type="password" 
                                    placeholder="Password" 
                                    value={teacherPass} 
                                    onChange={e => { setTeacherPass(e.target.value); clearError(); }}
                                    className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : ''}
                                />
                             </>
                         ) : (
                             <>
                                <Input 
                                    placeholder="Nama Lengkap" 
                                    value={studentName} 
                                    onChange={e => { setStudentName(e.target.value); clearError(); }}
                                    className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : ''}
                                />
                                <Select value={studentClass} onChange={e => { setStudentClass(e.target.value as ClassName); clearError(); }}>
                                    {['7A', '7B', '7C', '7D', '7E', '7F'].map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                             </>
                         )}

                         {error && (
                            <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-sm animate-pulse">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                         )}
                         
                         <Button className="w-full mt-2" onClick={role === 'teacher' ? handleTeacherLogin : handleStudentLogin}>
                             Masuk
                         </Button>

                         <button onClick={() => { setRole(null); setError(null); }} className="w-full text-center text-sm text-gray-400 hover:text-black mt-2 transition-colors">
                             Kembali
                         </button>
                     </div>
                </Card>
            )}
        </div>
    </div>
  );
};