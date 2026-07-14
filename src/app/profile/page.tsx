"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ActionModal, { ModalType } from "@/components/ActionModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [biography, setBiography] = useState("");
  const [age, setAge] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isLightMode, setIsLightMode] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "alert" as ModalType,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK"
  });

  const showModal = (type: ModalType, title: string, message: string, onConfirm: () => void, confirmText = "OK") => {
    setModalState({ isOpen: true, type, title, message, onConfirm, confirmText });
  };
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          setUser(u);
          setName(u.name || "");
          setPhone(u.phone || "");
          setGender(u.gender || "");
          setOccupation(u.occupation || "");
          setBiography(u.biography || "");
          setAge(u.age?.toString() || "");
          setDateOfBirth(u.dateOfBirth ? u.dateOfBirth.split("T")[0] : "");
          setProfilePicUrl(u.profilePicUrl || "");
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    
    if (document.documentElement.classList.contains('light-mode')) {
      setIsLightMode(true);
    }
  }, [router]);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-mode');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-mode');
      setIsLightMode(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress as JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setProfilePicUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, gender, occupation, biography, age: age ? parseInt(age) : undefined, dateOfBirth: dateOfBirth || undefined, profilePicUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        showModal("success", "Profile Updated", "Your travel profile has been saved successfully!", closeModal, "Wonderful");
      } else {
        const err = await res.json();
        showModal("error", "Save Failed", err.error || "Could not save your profile.", closeModal, "Close");
      }
    } catch {
      showModal("error", "Network Error", "Could not connect to the server.", closeModal, "Close");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0fdfa] flex items-center justify-center">
        <svg className="text-[#f59e0b] animate-spin w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
      </div>
    );
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const joinedYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024";

  return (
    <div className="bg-[#f0fdfa] text-slate-900 dark:text-slate-100 min-h-screen font-sans overflow-x-hidden relative" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 35%), radial-gradient(circle at 100% 100%, rgba(20, 184, 166, 0.08) 0%, transparent 35%), #020617' }}>
      
      <ActionModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
        confirmText={modalState.confirmText}
      />

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f8fafc]/60 backdrop-blur-xl border-b border-teal-100 dark:border-teal-900 shadow-lg shadow-[#f59e0b]/5">
        <div className="flex justify-between items-center px-6 md:px-10 h-20 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-2xl md:text-3xl tracking-tight text-[#ffc174] cursor-pointer active:scale-95 transition-transform flex items-center gap-2">
                <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                NaviBharat
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/5 transition-colors text-[#ffc174] cursor-pointer active:scale-95">
                {isLightMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                )}
            </button>
            {user && (
              <div className="scale-90 origin-right">
                <ProfileDropdown user={user} />
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-40 px-6 md:px-10 max-w-[1280px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300/60">
          <Link className="hover:text-[#ffc174] transition-colors" href="/dashboard">Dashboard</Link>
          <ChevronRight size={16} />
          <span className="text-slate-600 dark:text-slate-300">My Profile</span>
        </nav>

        {/* Hero Card */}
        <section className="bg-[#f8fafc]/60 backdrop-blur-xl border border-teal-100 dark:border-teal-900 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ffc174]/20 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4fdbc8]/20 blur-[100px] rounded-full"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="h-32 w-32 md:h-44 md:w-44 rounded-full overflow-hidden border-4 border-teal-100 dark:border-teal-900 ring-4 ring-[#ffc174]/20 bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-4xl font-bold text-slate-900 dark:text-slate-100 shadow-xl">
                 {profilePicUrl ? (
                    <img alt={name || "User"} src={profilePicUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 ) : (
                    initial
                 )}
              </div>
              <button type="button" className="absolute bottom-2 right-2 bg-[#ffc174] text-[#613b00] p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                 <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">{name || "Explorer"}</h1>
                <span className="w-fit mx-auto md:mx-0 px-3 py-1 bg-[#4fdbc8]/20 text-[#0f766e] text-xs font-semibold rounded-full border border-[#4fdbc8]/30">Joined {joinedYear}</span>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-1">{user?.email}</p>
              <p className="text-sm font-semibold text-[#ffc174] mb-4">{occupation || "No occupation added"}</p>
              <p className="italic text-slate-600 dark:text-slate-300/80 text-base max-w-lg">
                  "{biography || "No biography added yet. Tell us your travel story."}"
              </p>
            </div>
          </div>
        </section>

        {/* Edit Form Area Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-[#f8fafc]/60 backdrop-blur-xl border border-teal-100 dark:border-teal-900 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(20,184,166,0.3)]">
            <div className="flex items-center gap-3 mb-8">
              <svg className="text-[#0f766e] w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Personal Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Full Name</label>
                <input required onChange={(e) => setName(e.target.value)} value={name} className="w-full bg-[#e2e8f0] border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#ffc174] focus:border-transparent outline-none transition-all shadow-[0_0_15px_rgba(245,158,11,0)] focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" type="text" placeholder="Your full name" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Phone Number</label>
                  <input onChange={(e) => setPhone(e.target.value)} value={phone} className="w-full bg-[#e2e8f0] border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#ffc174] focus:border-transparent outline-none transition-all shadow-[0_0_15px_rgba(245,158,11,0)] focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" type="tel" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Gender</label>
                  <select onChange={(e) => setGender(e.target.value)} value={gender} className="w-full bg-[#e2e8f0] border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#ffc174] focus:border-transparent outline-none transition-all shadow-[0_0_15px_rgba(245,158,11,0)] focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Age</label>
                  <input onChange={(e) => setAge(e.target.value)} value={age} className="w-full bg-[#e2e8f0] border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#ffc174] focus:border-transparent outline-none transition-all shadow-[0_0_15px_rgba(245,158,11,0)] focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" type="number" placeholder="28" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Date of Birth</label>
                  <input onChange={(e) => setDateOfBirth(e.target.value)} value={dateOfBirth} className="w-full bg-[#e2e8f0] border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#ffc174] focus:border-transparent outline-none transition-all shadow-[0_0_15px_rgba(245,158,11,0)] focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" type="date" />
                </div>
              </div>
            </div>
          </div>

          {/* Occupation & Biography Card */}
          <div className="bg-[#f8fafc]/60 backdrop-blur-xl border border-teal-100 dark:border-teal-900 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] h-full">
            <div className="flex items-center gap-3 mb-8">
              <svg className="text-[#ffc174] w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Occupation &amp; Biography</h2>
            </div>
            
            <div className="space-y-6 h-full flex flex-col">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Occupation</label>
                <input onChange={(e) => setOccupation(e.target.value)} value={occupation} className="w-full bg-[#e2e8f0] border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#4fdbc8] focus:border-transparent outline-none transition-all shadow-[0_0_15px_rgba(20,184,166,0)] focus:shadow-[0_0_15px_rgba(20,184,166,0.1)]" type="text" placeholder="e.g. Adventure Photographer" />
              </div>
              <div className="space-y-2 flex-1 pb-16">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Travel Biography</label>
                <textarea onChange={(e) => setBiography(e.target.value)} value={biography} className="w-full h-40 md:h-[calc(100%-2rem)] bg-[#e2e8f0] border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-4 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#4fdbc8] focus:border-transparent outline-none transition-all resize-none shadow-[0_0_15px_rgba(20,184,166,0)] focus:shadow-[0_0_15px_rgba(20,184,166,0.1)]" placeholder="Tell us your travel story..."></textarea>
              </div>
            </div>
          </div>
          
          {/* Submit trigger button (hidden but allows enter to submit if needed) */}
          <button type="submit" className="hidden">Submit</button>
        </form>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-[#e2e8f0]/80 backdrop-blur-md border-t border-teal-50 dark:border-teal-900">
        <div className="flex justify-between items-center py-4 md:py-6 px-6 md:px-10 w-full max-w-[1280px] mx-auto gap-4">
          <div className="flex items-center gap-2">
            <svg className="text-slate-600 dark:text-slate-300/40 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Member Since {joinedYear}</p>
          </div>
          <div className="flex items-center gap-6">
            <button disabled={saving} onClick={handleSave} className="bg-gradient-to-r from-[#d97706] to-[#ffc174] text-[#613b00] px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:scale-100">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
