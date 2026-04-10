"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActionModal, { ModalType } from "@/components/ActionModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import {
  User, Mail, Phone, Briefcase, CalendarDays, BookOpen,
  Save, MapPin, Compass, Sun, Moon, ChevronRight, Shield, Edit3
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [biography, setBiography] = useState("");
  const [age, setAge] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

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

    if (document.documentElement.classList.contains("light-mode")) setIsLightMode(true);

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
  }, [router]);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove("light-mode");
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add("light-mode");
      setIsLightMode(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, gender, occupation, biography, age: age ? parseInt(age) : undefined, dateOfBirth: dateOfBirth || undefined })
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Compass className="text-amber-500 animate-spin" size={48} />
      </div>
    );
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden pb-20">
      <ActionModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
        confirmText={modalState.confirmText}
      />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo-v2.png" alt="NaviBharat Logo" width={38} height={38} className="rounded-xl shadow-md group-hover:scale-105 transition-transform" />
            <span className="font-extrabold tracking-tight text-2xl text-amber-500 drop-shadow-md">NaviBharat</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-300 hover:text-amber-400 hover:bg-slate-900/50 rounded-xl transition-all">
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
            {user && <ProfileDropdown user={user} />}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 relative z-10 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
          <ChevronRight size={14} />
          <span className="text-slate-300 font-medium">My Profile</span>
        </div>

        {/* Hero Card */}
        <div className="relative mb-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-teal-500/20 rounded-3xl blur-xl" />
          <Card className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-32 bg-gradient-to-r from-amber-600/30 via-slate-900 to-teal-600/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-10" />
              <div className="absolute top-4 right-6 flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 px-3 py-1 rounded-full">
                <Shield size={12} className="text-teal-400" />
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">{user?.role || "User"}</span>
              </div>
            </div>

            <div className="px-8 pb-8 -mt-10 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                {/* Avatar */}
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-400 flex items-center justify-center text-slate-950 font-black text-5xl shadow-[0_0_30px_rgba(245,158,11,0.5)] border-4 border-slate-900 ring-2 ring-amber-500/30 transition-all group-hover:shadow-[0_0_40px_rgba(245,158,11,0.7)]">
                    {initial}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Edit3 size={13} className="text-slate-950" />
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-black text-white tracking-tight">{user?.name || "Explorer"}</h1>
                  <p className="text-slate-400 flex items-center gap-2 mt-1">
                    <Mail size={14} className="text-amber-500" /> {user?.email}
                  </p>
                  {user?.occupation && (
                    <p className="text-slate-400 flex items-center gap-2 mt-1">
                      <Briefcase size={14} className="text-teal-500" /> {user.occupation}
                    </p>
                  )}
                  {user?.biography && (
                    <p className="text-slate-500 text-sm mt-2 italic max-w-md">"{user.biography}"</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 text-right shrink-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={12} />
                    <span>Joined {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <User size={18} />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="h-12 bg-slate-950/80 border-white/10 text-white rounded-xl focus:border-amber-500 focus:ring-amber-500/20" placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-12 bg-slate-950/80 border-white/10 text-white rounded-xl focus:border-amber-500" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="h-12 bg-slate-950/80 border-white/10 text-white rounded-xl focus:border-amber-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-Binary</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Age</Label>
                  <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="h-12 bg-slate-950/80 border-white/10 text-white rounded-xl focus:border-amber-500" placeholder="e.g. 25" min="1" max="120" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date of Birth</Label>
                  <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="h-12 bg-slate-950/80 border-white/10 text-white rounded-xl focus:border-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <div className="space-y-6">
            <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center border border-teal-500/20">
                    <Briefcase size={18} />
                  </div>
                  Occupation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">What do you do?</Label>
                  <Input value={occupation} onChange={e => setOccupation(e.target.value)} className="h-12 bg-slate-950/80 border-white/10 text-white rounded-xl focus:border-teal-500" placeholder="e.g. Software Engineer, Artist..." />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <BookOpen size={18} />
                  </div>
                  Travel Biography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Tell your travel story</Label>
                  <textarea
                    value={biography}
                    onChange={e => setBiography(e.target.value)}
                    rows={4}
                    placeholder="A passionate traveler who loves discovering hidden gems across India..."
                    className="w-full bg-slate-950/80 border border-white/10 text-white rounded-xl p-4 text-sm resize-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-slate-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Travel Stats */}
        <Card className="mt-6 bg-gradient-to-r from-amber-600/10 via-slate-900/60 to-teal-600/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Member Since</p>
                  <p className="text-xl font-black text-white">{new Date(user?.createdAt).getFullYear()}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-12 hidden sm:block bg-white/10" />
              <div className="flex-1 flex justify-center sm:justify-end">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-teal-500 rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="relative h-14 px-10 text-base font-black rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 border-0 shadow-xl transition-all active:scale-95"
                  >
                    <Save size={18} className="mr-2" />
                    {saving ? "Saving Profile..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
