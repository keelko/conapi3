
import React, { useState, useEffect } from 'react';
import { AppView, Worker, User, Cantiere, Presence, CorrectionRequest } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import WorkerList from './components/WorkerList.tsx';
import WorkerForm from './components/WorkerForm.tsx';
import AuthView from './components/Auth.tsx';
import VerificationView from './components/VerificationView.tsx';
import CompanyProfile from './components/CompanyProfile.tsx';
import CantiereManager from './components/CantiereManager.tsx';
import PresenceTracker from './components/PresenceTracker.tsx';
import GeneralLog from './components/GeneralLog.tsx';
import SiteQrGenerator from './components/SiteQrGenerator.tsx';
import CalendarView from './components/CalendarView.tsx';
import CorrectionRequestManager from './components/CorrectionRequestManager.tsx';
import SystemMaintenance from './components/SystemMaintenance.tsx';
import AiAdvisor from './components/AiAdvisor.tsx';
import StatisticsView from './components/StatisticsView.tsx';
import CompanyListView from './components/CompanyListView.tsx';
import { auth, db, onAuthStateChanged, signOut } from './firebase.ts';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, limit, getDoc } from 'firebase/firestore';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sites, setSites] = useState<Cantiere[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [selectedWorkerIdForDossier, setSelectedWorkerIdForDossier] = useState<string | null>(null);

  const sortPresences = (data: Presence[]) => {
    return data.sort((a, b) => {
      const timeA = a.timestamp?.seconds || (Date.now() / 1000);
      const timeB = b.timestamp?.seconds || (Date.now() / 1000);
      return timeB - timeA;
    });
  };

  const sortRequests = (data: CorrectionRequest[]) => {
    return data.sort((a, b) => {
      const timeA = a.createdAt?.seconds || (Date.now() / 1000);
      const timeB = b.createdAt?.seconds || (Date.now() / 1000);
      return timeB - timeA;
    });
  };

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev + 0.5 > 95 ? 95 : prev + 0.5;
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [loading]);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    let unsubscribeAllUsers: (() => void) | null = null;
    let unsubscribeWorkers: (() => void) | null = null;
    let unsubscribeSites: (() => void) | null = null;
    let unsubscribePresences: (() => void) | null = null;
    let unsubscribeRequests: (() => void) | null = null;

    const urlParams = new URLSearchParams(window.location.search);
    const publicId = urlParams.get('id');

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        if (publicId) {
          setCurrentView(AppView.VERIFY);
          setLoading(false);
        } else {
          setUser(null);
          setCurrentView(AppView.LOGIN);
          setLoading(false);
        }
        return;
      }

      unsubscribeUser = onSnapshot(doc(db, "users", fbUser.uid), async (userSnap) => {
        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userSnap.data() as User;
        setUser({ id: fbUser.uid, ...userData });

        const handleError = (error: any) => {
          console.error("Firestore Permission/Access Error:", error.code);
        };

        if (publicId) {
          setCurrentView(AppView.VERIFY);
        } else if (userData.role === 'WORKER') {
          setCurrentView(AppView.PRESENZE_WORKER);
        } else if (userData.role === 'SUPER_ADMIN') {
          if (currentView === AppView.LOGIN) setCurrentView(AppView.STATISTICS);
        } else {
          if (currentView === AppView.LOGIN) setCurrentView(AppView.DASHBOARD);
        }

        if (userData.role === 'WORKER') {
          const myCF = (userData.vatNumber || "").toUpperCase().trim();
          unsubscribeSites = onSnapshot(collection(db, "sites"), (snap) => setSites(snap.docs.map(d => ({ ...d.data(), id: d.id } as Cantiere))), handleError);
          unsubscribeWorkers = onSnapshot(collection(db, "workers"), (snap) => setWorkers(snap.docs.map(d => ({ ...d.data(), id: d.id } as Worker))), handleError);
          const pq = query(collection(db, "presences"), where("workerId", "==", myCF), limit(150));
          unsubscribePresences = onSnapshot(pq, (snap) => setPresences(sortPresences(snap.docs.map(d => ({ ...d.data(), id: d.id } as Presence)))), handleError);
          const rq = query(collection(db, "correction_requests"), where("requesterId", "==", fbUser.uid));
          unsubscribeRequests = onSnapshot(rq, (snap) => setRequests(sortRequests(snap.docs.map(d => ({ ...d.data(), id: d.id } as CorrectionRequest)))), handleError);
        } 
        else if (userData.role === 'SUPER_ADMIN') {
          unsubscribeAllUsers = onSnapshot(collection(db, "users"), (snap) => setAllUsers(snap.docs.map(d => ({ ...d.data(), id: d.id } as User))), handleError);
          unsubscribeWorkers = onSnapshot(collection(db, "workers"), (snap) => setWorkers(snap.docs.map(d => ({ ...d.data(), id: d.id } as Worker))), handleError);
          unsubscribeSites = onSnapshot(collection(db, "sites"), (snap) => setSites(snap.docs.map(d => ({ ...d.data(), id: d.id } as Cantiere))), handleError);
          unsubscribePresences = onSnapshot(query(collection(db, "presences"), limit(1000)), (snap) => setPresences(sortPresences(snap.docs.map(d => ({ ...d.data(), id: d.id } as Presence)))), handleError);
          unsubscribeRequests = onSnapshot(collection(db, "correction_requests"), (snap) => setRequests(sortRequests(snap.docs.map(d => ({ ...d.data(), id: d.id } as CorrectionRequest)))), handleError);
        }
        else {
          unsubscribeWorkers = onSnapshot(query(collection(db, "workers"), where("userId", "==", fbUser.uid)), (snap) => setWorkers(snap.docs.map(d => ({ ...d.data(), id: d.id } as Worker))), handleError);
          unsubscribeSites = onSnapshot(query(collection(db, "sites"), where("userId", "==", fbUser.uid)), (snap) => setSites(snap.docs.map(d => ({ ...d.data(), id: d.id } as Cantiere))), handleError);
          const pq = query(collection(db, "presences"), where("userId", "==", fbUser.uid), limit(250));
          unsubscribePresences = onSnapshot(pq, (snap) => setPresences(sortPresences(snap.docs.map(d => ({ ...d.data(), id: d.id } as Presence)))), handleError);
          const rq = query(collection(db, "correction_requests"), where("userId", "==", fbUser.uid));
          unsubscribeRequests = onSnapshot(rq, (snap) => setRequests(sortRequests(snap.docs.map(d => ({ ...d.data(), id: d.id } as CorrectionRequest)))), handleError);
        }
        
        setTimeout(() => setLoading(false), 800);
      });
    });

    return () => {
      unsubscribeAuth();
      [unsubscribeUser, unsubscribeAllUsers, unsubscribeWorkers, unsubscribeSites, unsubscribePresences, unsubscribeRequests].forEach(u => u && u());
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentView(AppView.LOGIN);
    window.history.replaceState({}, document.title, window.location.pathname);
    setLoadingProgress(0);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c1626] relative overflow-hidden font-['Inter']">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8">
        <div className="mb-12 relative group flex flex-col items-center">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse transition-all duration-700" />
            <img src="https://i.imgur.com/gAV7CeH.png" className="h-28 relative z-10 object-contain drop-shadow-2xl" alt="CoNAPI Logo" />
            <p className="text-white text-xs font-medium mt-4 relative z-10 uppercase tracking-widest">Co.N.A.P.I. Nazionale</p>
        </div>
        <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden mb-6 relative border border-white/5">
          <div className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(245,158,11,0.6)]" style={{ width: `${loadingProgress}%` }} />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-white font-black text-4xl tracking-tighter tabular-nums transition-all">{Math.min(100, Math.round(loadingProgress))}%</h2>
          <div className="h-6 flex items-center justify-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[4px] animate-pulse">
              {loadingProgress < 20 ? 'Inizializzazione...' : loadingProgress < 50 ? 'Autenticazione OPN...' : loadingProgress < 80 ? 'Sincronizzazione DB...' : 'Finalizzazione Accesso...'}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 text-[9px] text-slate-600 font-bold uppercase tracking-widest">Sistema Badge Digitale v2.5</div>
    </div>
  );

  if (currentView === AppView.LOGIN) return <AuthView onLogin={() => { setLoading(true); setLoadingProgress(0); }} />;

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      
      {user && (
        <Sidebar 
          currentView={currentView} 
          isOpen={isSidebarOpen} 
          setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
          onLogout={handleLogout} 
          user={user} 
          pendingRequestsCount={requests.filter(r => r.status === 'PENDING').length}
        />
      )}
      
      <main className={`flex-1 ${user ? 'lg:ml-64' : ''} p-4 md:p-8 w-full max-w-[1600px] mx-auto`}>
        {user && (
          <header className="mb-6 flex items-center justify-between lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200"><Menu className="w-6 h-6 text-slate-600" /></button>
            <div className="flex flex-col items-end">
              <img src="https://i.imgur.com/gAV7CeH.png" className="h-8 mb-1" alt="CoNAPI" />
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Co.N.A.P.I. Nazionale</span>
            </div>
          </header>
        )}

        {!user && currentView === AppView.VERIFY && (
          <div className="mb-8 flex justify-between items-center">
             <img src="https://i.imgur.com/gAV7CeH.png" className="h-10" alt="CoNAPI" />
             <button onClick={() => setCurrentView(AppView.LOGIN)} className="px-6 py-2 bg-[#0c1626] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Area Riservata</button>
          </div>
        )}

        {currentView === AppView.DASHBOARD && <Dashboard workers={workers} sites={sites} presences={presences} requests={requests} setView={setCurrentView} user={user} />}
        {currentView === AppView.STATISTICS && <StatisticsView workers={workers} sites={sites} presences={presences} allUsers={allUsers} />}
        {currentView === AppView.COMPANY_LIST && <CompanyListView allUsers={allUsers} workers={workers} sites={sites} />}
        {currentView === AppView.AI_ADVISOR && <AiAdvisor workers={workers} sites={sites} user={user!} />}
        {currentView === AppView.CANTIERI && <CantiereManager sites={sites} user={user!} workers={workers} allUsers={allUsers} presences={presences} />}
        {currentView === AppView.QR_GENERATOR && <SiteQrGenerator sites={sites} />}
        {currentView === AppView.GENERAL_LOG && <GeneralLog presences={presences} workers={workers} sites={sites} user={user!} allUsers={allUsers} />}
        {currentView === AppView.PRESENZE_WORKER && <PresenceTracker user={user!} sites={sites} workers={workers} presences={presences} requests={requests} />}
        {currentView === AppView.CALENDAR && <CalendarView presences={presences} requests={requests} role={user?.role || 'WORKER'} />}
        {currentView === AppView.REQUESTS && <CorrectionRequestManager requests={requests} user={user!} workers={workers} sites={sites} allUsers={allUsers} />}
        {currentView === AppView.SYSTEM_MAINTENANCE && <SystemMaintenance user={user!} allUsers={allUsers} workers={workers} sites={sites} presences={presences} />}

        {currentView === AppView.WORKER_LIST && (
          <WorkerList 
            workers={workers} 
            presences={presences}
            viewMode="active"
            onDelete={(id, perm) => perm ? deleteDoc(doc(db, "workers", id)) : updateDoc(doc(db, "workers", id), { isArchived: true })} 
            onArchive={(id) => updateDoc(doc(db, "workers", id), { isArchived: true })}
            onRestore={(id) => updateDoc(doc(db, "workers", id), { isArchived: false })}
            onEdit={(w) => { setEditingWorker(w); setCurrentView(AppView.ADD_WORKER); }}
            onAdd={() => { setEditingWorker(null); setCurrentView(AppView.ADD_WORKER); }} 
            onViewFascicolo={(id) => setSelectedWorkerIdForDossier(id)}
            user={user}
            allUsers={allUsers}
          />
        )}
        
        {currentView === AppView.ADD_WORKER && (
          <WorkerForm 
            onSave={async (w) => { await setDoc(doc(db, "workers", w.id), { ...w, userId: user!.id }); setCurrentView(AppView.WORKER_LIST); }} 
            onCancel={() => setCurrentView(AppView.WORKER_LIST)} 
            user={user!} 
            existingWorkers={workers} 
            sites={sites}
            editingWorker={editingWorker}
          />
        )}
        
        {currentView === AppView.COMPANY_PROFILE && <CompanyProfile user={user} onUpdate={(updated) => setUser(updated)} />}
        {currentView === AppView.VERIFY && <VerificationView workers={workers} presences={presences} />}

        {selectedWorkerIdForDossier && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[3rem]">
              <button onClick={() => setSelectedWorkerIdForDossier(null)} className="absolute top-8 right-8 z-10 p-3 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-6 h-6"/></button>
              <VerificationView workers={workers} presences={presences} initialId={selectedWorkerIdForDossier} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
