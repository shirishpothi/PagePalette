import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft, Check, Sparkles, CreditCard, Banknote, ShieldCheck, Mail,
    User, Briefcase, GraduationCap, School, ChevronRight, Package, ArrowRight,
    Download, Home, BookOpen, Leaf, Heart
} from "lucide-react";
import { Button, Badge, Card } from "../../components/ui";
import { toPng } from "html-to-image";
import { format } from "date-fns";

// --- Constants & Data ---
// Note: Removed STL file URLs for faster loading. Using emoji representations.
const STL_OPTIONS = [
    { id: "tree", label: "Tree (Free)", color: "#22C55E", emoji: "🌲" },
    { id: "cat", label: "Cat", color: "#F59E0B", emoji: "🐱" },
    { id: "axolotl", label: "Axolotl", color: "#EC4899", emoji: "🦎" },
    { id: "snowman", label: "Snowman", color: "#3B82F6", emoji: "⛄" },
    { id: "reindeer", label: "Reindeer", color: "#EF4444", emoji: "🦌" },
    { id: "lakers", label: "Lakers", color: "#8B5CF6", emoji: "🏀" },
    { id: "ferrari", label: "Ferrari", color: "#DC2626", emoji: "🏎️" },
    { id: "mistletoe", label: "Mistletoe", color: "#10B981", emoji: "🌿" },
    { id: "67", label: "67", color: "#6366F1", emoji: "🔥" },
    { id: "nice", label: "Nice Feeling", color: "#14B8A6", emoji: "😌" },
    { id: "cools", label: "Cools", color: "#06B6D4", emoji: "😎" },
    { id: "gameover", label: "Game Over", color: "#8B5CF6", emoji: "🎮" },
];

const BUNDLES = [
    {
        id: "starter",
        price: 16,
        name: "Starter Bundle",
        description: "Perfect for getting started",
        includes: ["Palette Notebook", "Cover Board", "Free Tree PagePal 🌲"],
        allowExtraSelection: false,
        freeCount: 0 // In addition to the tree
    },
    {
        id: "complete",
        price: 21,
        name: "Complete Bundle",
        description: "Best value for students",
        includes: ["Palette Notebook", "Cover Board", "Free Tree PagePal 🌲", "3 additional PagePals of Choice"],
        allowExtraSelection: true,
        freeCount: 3 // In addition to the tree
    }
];

const YEARS = ["K", ...Array.from({ length: 13 }, (_, i) => (i + 1).toString())];
const CLASSES = Array.from({ length: 11 }, (_, i) => i.toString()); // 0-10

// --- Main Component ---

export default function OrderPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const receiptRef = useRef(null);
    const mainContentRef = useRef(null);

    // --- State ---
    const [step, setStep] = useState(1); // 1: Bundle, 2: Customs, 3: Info, 4: Payment, 5: Receipt

    // Scroll to top when step changes (fixes mobile scroll issue)
    useEffect(() => {
        // Scroll the window to top smoothly when step changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);
    // NOTE: If coming from Customizer, we might inject a "Verification" step (Step 1.5 effectively).
    // We'll handle this by using a specific step number, say 15 (between 1 and 2 conceptually, or just redirect the flow).
    // Let's use Step 15 for "Verification".

    const [selectedBundle, setSelectedBundle] = useState(BUNDLES[1]); // Default to Complete

    // Check for pre-selected items from URL (Customizer Integration)
    useEffect(() => {
        const itemsParam = searchParams.get('items');
        if (itemsParam) {
            const itemIds = itemsParam.split(',');

            // Map IDs to actual item objects
            const items = itemIds.map(id => STL_OPTIONS.find(opt => opt.id === id)).filter(Boolean);

            // Distribute into bundle/extra logic based on CURRENT selectedBundle
            // Note: This logic runs once on mount/param change. 
            // If user changes bundle later, the selections persist but their status (free/extra) might change automatically via render logic,
            // but we need to set the state arrays initially.

            // Correction: Our state is just 'bundleSelections' and 'extraSelections'.
            // unique items only.
            const uniqueItems = Array.from(new Set(items)); // remove dupes if any

            // Remove Tree if passed (it's always base)
            const collection = uniqueItems.filter(i => i.id !== 'tree');

            const bundleLimit = selectedBundle.freeCount;

            const newBundleSelections = collection.slice(0, bundleLimit);
            const newExtraSelections = collection.slice(bundleLimit);

            setBundleSelections(newBundleSelections);
            setExtraSelections(newExtraSelections);

            // If items are passed, go to Verification Step (15) instead of standard flow
            if (items.length > 0) {
                setStep(15);
            }
        }
    }, [searchParams, selectedBundle]);

    // Selection State
    // "Tree" is always included free.
    // "Bundle selections" are the 3 free ones if applicable.
    // "Extras" are paid ($3 each).
    const [bundleSelections, setBundleSelections] = useState([]);
    const [extraSelections, setExtraSelections] = useState([]);

    // Verification State
    const [confirmedItems, setConfirmedItems] = useState([]);

    // Derived state for Verification
    const allImportedItems = [...bundleSelections, ...extraSelections];

    // Form State
    const [role, setRole] = useState("student"); // student | parent | teacher
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        // Student Specific
        studentName: "", // for parent
        studentEmail: "", // for parent
        studentYear: "12",
        studentClass: "1",
        // Teacher Specific
        position: "",
        room: "",
    });

    // Payment
    const [paymentMethod, setPaymentMethod] = useState("paynow");

    // Order Status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [receiptUrl, setReceiptUrl] = useState(null);

    // Verification helpers
    const toggleConfirmation = (itemId) => {
        setConfirmedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const confirmAll = () => {
        setConfirmedItems(allImportedItems.map(item => item.id));
    };

    const isVerificationComplete = confirmedItems.length === allImportedItems.length && allImportedItems.length > 0;

    // --- Calculations ---

    const calculateTotal = () => {
        let total = selectedBundle.price;
        // Add extras
        total += extraSelections.length * 3;
        return total;
    };

    const currentTotal = calculateTotal();

    // --- Handlers ---

    const handleBundleSelect = (bundle) => {
        setSelectedBundle(bundle);
        // Reset selections if switching bundles to avoid invalid states
        setBundleSelections([]);
        setStep(2);
    };

    const toggleSelection = (item) => {
        // If it's already in bundle selections, remove it
        if (bundleSelections.find(i => i.id === item.id)) {
            setBundleSelections(prev => prev.filter(i => i.id !== item.id));
            return;
        }
        // If it's in extras, remove it
        if (extraSelections.find(i => i.id === item.id)) {
            setExtraSelections(prev => prev.filter(i => i.id !== item.id));
            return;
        }

        // Try to add to bundle selections first if there's room
        if (selectedBundle.freeCount > 0 && bundleSelections.length < selectedBundle.freeCount) {
            setBundleSelections(prev => [...prev, item]);
        } else {
            // Otherwise add to extras
            setExtraSelections(prev => [...prev, item]);
        }
    };

    const getSelectionStatus = (item) => {
        if (bundleSelections.find(i => i.id === item.id)) return "bundle";
        if (extraSelections.find(i => i.id === item.id)) return "extra";
        return "none";
    };

    const handleSubmitOrder = async () => {
        setIsSubmitting(true);
        const newOrderId = `PP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${format(new Date(), "MMdd")}`;
        setOrderId(newOrderId);

        // Construct Item String
        const allItems = ["Tree (Free)", ...bundleSelections.map(i => i.label), ...extraSelections.map(i => `${i.label} (Extra)`)];
        const orderDate = new Date().toISOString().replace('T', ' ').split('.')[0];

        // Order data for SheetDB
        const orderData = {
            "Order ID": newOrderId,
            "Date": orderDate,
            "Order Type": "Pre-Order",
            "Bundle": allItems.join(", ").includes("Starter") ? "Starter Bundle" : "Complete Bundle",
            "Name": formData.name,
            "Email": formData.email,
            "Role": role || "N/A",
            "Student Name": formData.studentName || "N/A",
            "Student Email": formData.studentEmail || "N/A",
            "Year": formData.studentYear || "N/A",
            "Class": formData.studentClass || "N/A",
            "Position": formData.position || "N/A",
            "Room": role === 'teacher' ? (formData.room || "N/A") : "N/A",
            "Items": allItems.join(", "),
            "Total Amount": currentTotal.toFixed(2),
            "Payment Method": paymentMethod || "N/A",
            "Status": "Pending Payment"
        };

        try {
            // Call our API to save order and send emails
            const response = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderData,
                    customerEmail: formData.email,
                    customerName: formData.name,
                    orderId: newOrderId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Order API Error:", errorData);
            }

            // Move to success step
            setStep(5);
        } catch (err) {
            console.error("Order Submission Failed", err);
            // Still proceed to success to not block user
            setStep(5);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadReceipt = async () => {
        if (receiptRef.current) {
            try {
                const dataUrl = await toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#0f1115' });
                const link = document.createElement("a");
                link.download = `PagePalette-Receipt-${orderId}.png`;
                link.href = dataUrl;
                link.click();
            } catch (e) {
                console.error(e);
            }
        }
    };

    // --- Render Steps ---

    const renderStep1_Bundles = () => (
        <div className="space-y-4 md:space-y-6 animate-fade-in-up">
            <div className="text-center mb-4 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera mb-1 md:mb-2">Choose Your Bundle</h2>
                <p className="text-sm md:text-base text-[#888888] font-montserrat mb-3 md:mb-4">Select standard or customization package</p>
                
                {/* Social Proof - Hidden on very small screens for space */}
                <div className="hidden sm:flex items-center justify-center gap-2 mb-4 md:mb-6">
                    <div className="flex -space-x-2">
                        {[1,2,3,4,5].map((_, i) => (
                            <div key={i} className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-[#4ADE80] to-[#36484d] border-2 border-[#0a0a0a] flex items-center justify-center text-xs">🎒</div>
                        ))}
                    </div>
                </div>
                
                <img src="/logo-full.png" alt="PagePalette" className="h-12 md:h-16 w-auto mx-auto object-contain brightness-0 invert opacity-80" loading="lazy" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                {BUNDLES.map(bundle => (
                    <div
                        key={bundle.id}
                        onClick={() => handleBundleSelect(bundle)}
                        className={`
              relative p-5 md:p-8 rounded-2xl border cursor-pointer transition-all duration-300 group backdrop-blur-sm flex flex-col overflow-hidden active:scale-[0.98]
              ${bundle.id === 'complete' 
                  ? "bg-gradient-to-br from-[#36484d]/30 to-[#2a3a40]/20 border-[#4ADE80] shadow-lg shadow-[#4ADE80]/20"
                  : selectedBundle.id === bundle.id
                      ? "bg-[#36484d]/20 border-[#4ADE80] shadow-lg shadow-[#4ADE80]/10"
                      : "bg-[#0f1115]/80 border-[#252525] hover:border-[#4ADE80]/50 hover:bg-[#151515]"}
            `}
                    >
                        {/* Best Value Badge for Complete Bundle */}
                        {bundle.id === 'complete' && (
                            <div className="absolute top-0 right-0 z-10">
                                <div className="relative">
                                    {/* Animated glow background */}
                                    <div className="absolute inset-0 bg-[#4ADE80] blur-lg opacity-40 animate-max-pulse" />
                                    {/* Main badge */}
                                    <div className="relative bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] px-3 md:px-4 py-1 md:py-1.5 rounded-bl-xl border-l border-b border-[#4ADE80]/50">
                                        <span className="font-bold text-xs md:text-sm tracking-wide text-white animate-max-shimmer bg-gradient-to-r from-white via-[#4ADE80] to-white bg-[length:200%_100%] bg-clip-text [-webkit-text-fill-color:transparent] whitespace-nowrap">
                                            BEST VALUE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl md:text-2xl font-bold text-white font-proxima-sera">{bundle.name}</h3>
                            <span className="text-2xl md:text-4xl font-bold text-[#4ADE80] font-proxima-sera">${bundle.price}</span>
                        </div>

                        <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8 flex-1">
                            {bundle.includes.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-[#CCCCCC] font-montserrat">
                                    <Check size={14} className="mt-0.5 text-[#4ADE80] flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                            {bundle.id === 'complete' && (
                                <li className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-[#4ADE80] font-montserrat font-bold">
                                    <Check size={14} className="mt-0.5 text-[#4ADE80] flex-shrink-0" />
                                    ✨ Save $9 vs buying separately!
                                </li>
                            )}
                        </ul>

                        <Button 
                            variant="secondary" 
                            size="lg"
                            className={`w-full mt-auto ${bundle.id === 'complete' 
                                ? "bg-[#4ADE80] hover:bg-[#22C55E] text-[#0a0a0a] border-0 font-bold" 
                                : "bg-[#1a1a1a] border-[#333] group-hover:bg-[#252525]"}`}
                        >
                            Select {bundle.name}
                        </Button>
                    </div>
                ))}
            </div>
            
            {/* Minimal eco-friendly indicator */}
            <div className="mt-4 md:mt-8 flex items-center justify-center gap-2 text-xs md:text-sm text-[#666] font-montserrat">
                <Leaf size={14} className="text-[#4ADE80]" />
                <span>Eco-Friendly Materials</span>
            </div>
        </div>
    );

    const renderStep15_Verification = () => (
        <div className="animate-fade-in-up max-w-3xl mx-auto">
            <div className="glass p-8 rounded-3xl border border-[#36484d]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <span className="text-6xl">🧐</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 font-proxima-sera">Wait, let's double check!</h2>
                <p className="text-[#888] mb-6 font-montserrat">
                    Please confirm your design by tapping every item you selected.
                </p>

                <div className="flex justify-end mb-4">
                    <button
                        onClick={confirmAll}
                        className="text-xs text-[#4ADE80] underline hover:text-white transition-colors"
                    >
                        Select All
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {allImportedItems.map((item, idx) => {
                        const isConfirmed = confirmedItems.includes(item.id);
                        return (
                            <button
                                key={`${item.id}-${idx}`}
                                onClick={() => toggleConfirmation(item.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isConfirmed
                                    ? "bg-[#4ADE80]/10 border-[#4ADE80] scale-[1.02] shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                                    : "bg-[#151515] border-[#333] opacity-60 hover:opacity-100"
                                    }`}
                            >
                                <div className="text-4xl mb-2 filter drop-shadow-md">{item.emoji}</div>
                                <div className="text-sm font-bold text-white leading-tight">{item.label}</div>
                                {isConfirmed && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#4ADE80] rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-black" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#333]">
                    <div className="text-sm text-[#666]">
                        {confirmedItems.length} / {allImportedItems.length} confirmed
                    </div>
                    <Button
                        onClick={() => setStep(3)} // Proceed to User Info (skip step 2/customizing)
                        disabled={!isVerificationComplete}
                        className={`
                            transition-all duration-300 px-8
                            ${isVerificationComplete
                                ? "bg-[#4ADE80] text-black hover:bg-[#22C55E] hover:scale-105 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
                                : "bg-[#252525] text-[#555] cursor-not-allowed"}
                        `}
                    >
                        Looks Good! <ArrowRight size={18} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderStep2_Selection = () => (
        <div className="space-y-4 md:space-y-6 animate-fade-in-up">
            <div className="text-center mb-4 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera mb-1 md:mb-2">Customize Your Palette</h2>
                <p className="text-sm md:text-base text-[#888888] font-montserrat">
                    {selectedBundle.freeCount > 0
                        ? `Choose your ${selectedBundle.freeCount} included PagePals`
                        : "Add extra PagePals to your order"}
                </p>
            </div>

            {/* Mobile: Summary card at top for visibility */}
            <div className="lg:hidden">
                <Card className="p-4 bg-[#0f1115] border-[#1f1f1f] mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-[#888888]">{selectedBundle.name}</span>
                            <div className="text-xl font-bold text-[#4ADE80]">${currentTotal}</div>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => setStep(3)}>
                            Continue <ChevronRight size={14} />
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_300px] gap-4 md:gap-8">
                {/* Left: Options Grid */}
                <div className="space-y-4 md:space-y-8">
                    {/* Free Tree Notice - More compact on mobile */}
                    <div className="bg-[#36484d]/10 border border-[#36484d]/30 p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#22C55E] rounded-lg flex items-center justify-center text-xl md:text-2xl">
                            🌲
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm md:text-base">Tree PagePal</h4>
                            <p className="text-xs md:text-sm text-[#4ADE80]">FREE with every order!</p>
                        </div>
                        <Check size={20} className="text-[#4ADE80] flex-shrink-0" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                            <h3 className="text-base md:text-lg font-bold text-white">Full Collection</h3>
                            <span className="text-xs md:text-sm text-[#888888] bg-[#1a1a1a] px-2 py-1 rounded-full">
                                {selectedBundle.freeCount > 0 && bundleSelections.length < selectedBundle.freeCount
                                    ? `Pick ${selectedBundle.freeCount - bundleSelections.length} more`
                                    : "Extras +$3 each"}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 md:gap-4">
                            {STL_OPTIONS.filter(o => o.id !== 'tree').map(item => {
                                const status = getSelectionStatus(item);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleSelection(item)}
                                        className={`
                        relative p-2 md:p-4 rounded-xl border text-left transition-all active:scale-95
                        ${status === 'bundle' ? 'bg-[#4ADE80]/10 border-[#4ADE80] ring-2 ring-[#4ADE80]/50' :
                                                status === 'extra' ? 'bg-[#F59E0B]/10 border-[#F59E0B] ring-2 ring-[#F59E0B]/50' :
                                                    'bg-[#0f1115] border-[#252525] hover:border-[#333]'}
                      `}
                                    >
                                        {/* Selection indicator */}
                                        {status !== 'none' && (
                                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${status === 'bundle' ? 'bg-[#4ADE80] text-black' : 'bg-[#F59E0B] text-black'}`}>
                                                <Check size={12} />
                                            </div>
                                        )}
                                        <div
                                            className="w-full aspect-square rounded-lg mb-1 md:mb-3 shadow-lg flex items-center justify-center text-2xl md:text-4xl bg-[#1a1a1a]"
                                            style={{ borderTop: `3px solid ${item.color}` }}
                                        >
                                            {item.emoji}
                                        </div>
                                        <div className="font-semibold text-white text-[10px] md:text-sm truncate text-center">{item.label}</div>
                                        <div className="text-[9px] md:text-xs mt-0.5 md:mt-1 text-center">
                                            {status === 'bundle' && <span className="text-[#4ADE80] font-bold">FREE</span>}
                                            {status === 'extra' && <span className="text-[#F59E0B] font-bold">+$3</span>}
                                            {status === 'none' && <span className="text-[#666]">{selectedBundle.freeCount > bundleSelections.length ? "Free" : "+$3"}</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Summary Sticky - Hidden on mobile (using top card instead) */}
                <div className="hidden lg:block space-y-6">
                    <Card className="p-6 bg-[#0f1115] border-[#1f1f1f] sticky top-24">
                        <h3 className="font-bold text-white mb-4">Current Selection</h3>

                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#888888]">{selectedBundle.name}</span>
                                <span>${selectedBundle.price}</span>
                            </div>
                            {extraSelections.map(extra => (
                                <div key={extra.id} className="flex justify-between">
                                    <span className="text-[#888888]">+ {extra.label}</span>
                                    <span>$3</span>
                                </div>
                            ))}
                            <div className="border-t border-[#252525] pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-[#4ADE80]">${currentTotal}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button className="w-full" variant="primary" onClick={() => setStep(3)}>
                                Next: Your Details <ChevronRight size={16} />
                            </Button>
                            <Button className="w-full" variant="ghost" onClick={() => setStep(1)}>
                                Back to Bundles
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Mobile: Fixed bottom bar for navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1115]/95 backdrop-blur-xl border-t border-[#1f1f1f] p-4 z-40">
                <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="flex-shrink-0">
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <div className="text-center">
                        <div className="text-xs text-[#888888]">{bundleSelections.length + extraSelections.length} selected</div>
                        <div className="text-lg font-bold text-[#4ADE80]">${currentTotal}</div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setStep(3)} className="flex-shrink-0">
                        Continue <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
            {/* Spacer for fixed bottom bar on mobile */}
            <div className="lg:hidden h-20" />
        </div>
    );

    const renderStep3_Info = () => (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-4 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera mb-1 md:mb-2">Your Information</h2>
                <p className="text-sm md:text-base text-[#888888] font-montserrat">Quick details for delivery</p>
            </div>

            <div className="bg-[#0f1115] border border-[#1f1f1f] rounded-2xl p-4 md:p-8 space-y-4 md:space-y-8">

                {/* Role Type - Horizontal on mobile for less scrolling */}
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[
                        { id: 'student', icon: GraduationCap, label: 'Student' },
                        { id: 'parent', icon: User, label: 'Parent' },
                        { id: 'teacher', icon: Briefcase, label: 'Teacher' }
                    ].map(r => (
                        <button
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            className={`py-2 md:py-3 rounded-xl border flex flex-col items-center gap-1 md:gap-2 transition-all active:scale-95
                 ${role === r.id ? 'bg-[#4ADE80]/10 border-[#4ADE80] text-[#4ADE80]' : 'bg-[#151515] border-[#252525] text-[#666] hover:bg-[#1a1a1a]'}
               `}
                        >
                            <r.icon size={18} />
                            <span className="text-xs md:text-sm font-medium">{r.label}</span>
                        </button>
                    ))}
                </div>

                {/* Inputs */}
                <div className="space-y-3 md:space-y-4">
                    {/* Common Fields */}
                    <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#666] uppercase">
                                {role === 'parent' ? "Parent Name" : "Name"}
                            </label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3.5 text-base focus:border-[#4ADE80] outline-none text-white"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#666] uppercase">
                                {role === 'parent' ? "Parent Email" : "Email"}
                            </label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3.5 text-base focus:border-[#4ADE80] outline-none text-white"
                                placeholder="nexus.edu.sg address"
                            />
                        </div>
                    </div>

                    {/* Parent Specific */}
                    {role === 'parent' && (
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[#252525]">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#666] uppercase">Student Name</label>
                                <input
                                    required
                                    value={formData.studentName}
                                    onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3 text-sm focus:border-[#4ADE80] outline-none text-white"
                                    placeholder="Child's Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#666] uppercase">Student Email</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.studentEmail}
                                    onChange={e => setFormData({ ...formData, studentEmail: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3 text-sm focus:border-[#4ADE80] outline-none text-white"
                                    placeholder="Child's school email"
                                />
                            </div>
                        </div>
                    )}

                    {/* Student Details (Student & Parent) */}
                    {(role === 'student' || role === 'parent') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#666] uppercase">Year Group</label>
                                <select
                                    value={formData.studentYear}
                                    onChange={e => setFormData({ ...formData, studentYear: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3 text-sm focus:border-[#4ADE80] outline-none text-white appearance-none"
                                >
                                    {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#666] uppercase">Class Number</label>
                                <select
                                    value={formData.studentClass}
                                    onChange={e => setFormData({ ...formData, studentClass: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3 text-sm focus:border-[#4ADE80] outline-none text-white appearance-none"
                                >
                                    {CLASSES.map(c => <option key={c} value={c}>.{c}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Teacher Specific */}
                    {role === 'teacher' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#666] uppercase">Position / Dept</label>
                                <input
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3 text-sm focus:border-[#4ADE80] outline-none text-white"
                                    placeholder="e.g. Science"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#666] uppercase">Room Number</label>
                                <input
                                    value={formData.room}
                                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3 text-sm focus:border-[#4ADE80] outline-none text-white"
                                    placeholder="e.g. 4N-12"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
                    <Button
                        variant="primary"
                        onClick={() => setStep(4)}
                        className="flex-[2]"
                        disabled={!formData.name || !formData.email}
                    >
                        Proceed to Payment
                    </Button>
                </div>

            </div>
        </div>
    );

    const renderStep4_Payment = () => (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* --- STEP 15: VERIFICATION (Customizer Flow Only) --- */}
            {step === 15 && renderStep15_Verification()}

            <div className="grid md:grid-cols-[1fr_320px] gap-4 md:gap-8">
                {/* Left: Methods */}
                <div className="space-y-4 md:space-y-6">
                    <div className="mb-2 md:mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera">Payment</h2>
                        <p className="text-sm md:text-base text-[#888888]">Choose a payment method</p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <div
                            onClick={() => setPaymentMethod('paynow')}
                            className={`p-4 md:p-6 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${paymentMethod === 'paynow' ? 'bg-[#4ADE80]/5 border-[#4ADE80] ring-1 ring-[#4ADE80]' : 'bg-[#0f1115] border-[#252525] hover:bg-[#151515]'}`}
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'paynow' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-[#666]'}`}>
                                    {paymentMethod === 'paynow' && <Check size={12} className="text-black" />}
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-white">PayNow Transfer</h3>
                            </div>

                            {paymentMethod === 'paynow' && (
                                <div className="mt-4 space-y-4 animate-fade-in">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-xl mx-auto sm:mx-0 flex-shrink-0">
                                            <img src="/paynow-qr.jpg" alt="QR" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="space-y-1.5 text-sm flex-1 text-center sm:text-left">
                                            <p className="text-[#888888]">Pay to Mobile:</p>
                                            <p className="text-xl md:text-2xl font-mono text-white tracking-wider font-bold">+65 8301 0149</p>
                                            <p className="text-[#888888]">Recipient:</p>
                                            <p className="font-bold text-white uppercase">Nicole Xu</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-3 md:p-4 rounded-xl text-xs md:text-sm border border-[#333]">
                                        <p className="text-[#F59E0B] font-bold mb-1">⚠️ Important:</p>
                                        Screenshot your receipt after paying. We'll confirm via email.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-4 md:p-6 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${paymentMethod === 'cash' ? 'bg-[#4ADE80]/5 border-[#4ADE80] ring-1 ring-[#4ADE80]' : 'bg-[#0f1115] border-[#252525] hover:bg-[#151515]'}`}
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cash' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-[#666]'}`}>
                                    {paymentMethod === 'cash' && <Check size={12} className="text-black" />}
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-white">Cash Payment</h3>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="mt-4 text-sm text-[#CCCCCC]">
                                    <p className="mb-2">Pay in person to:</p>
                                    <ul className="space-y-1 mb-3 font-semibold text-white">
                                        <li>• Shirish Pothi</li>
                                        <li>• Julian Dizon</li>
                                    </ul>
                                    <p className="text-xs">Contact <span className="text-[#4ADE80]">shirish.pothi.27@nexus.edu.sg</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Summary - Show as card on mobile, sticky on desktop */}
                <div className="md:space-y-6">
                    <Card className="p-4 md:p-6 bg-[#0f1115] border-[#1f1f1f] md:sticky md:top-24">
                        <h3 className="font-bold text-white mb-3 md:mb-4 pb-2 md:pb-4 border-b border-[#252525] text-sm md:text-base">Order Summary</h3>

                        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white font-medium">{selectedBundle.name}</span>
                                <span className="text-white">${selectedBundle.price}</span>
                            </div>
                            {extraSelections.length > 0 && (
                                <div className="pt-2 border-t border-[#252525]">
                                    <p className="text-[#888888] text-xs mb-1">Extras:</p>
                                    {extraSelections.map((e, i) => (
                                        <div key={i} className="flex justify-between">
                                            <span className="text-[#CCCCCC] text-xs">{e.label}</span>
                                            <span className="text-xs">$3</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="pt-3 border-t border-[#252525] flex justify-between items-end">
                                <span className="font-bold text-white">Total</span>
                                <span className="font-bold text-2xl md:text-3xl text-[#4ADE80]">${currentTotal}</span>
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <Button className="w-full" size="lg" variant="primary" onClick={handleSubmitOrder} disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : "Confirm & Pay"}
                                {!isSubmitting && <ArrowRight size={16} />}
                            </Button>
                            <Button className="w-full" variant="ghost" size="sm" onClick={() => setStep(3)}>
                                Back to Details
                            </Button>
                        </div>

                        <p className="text-center text-[10px] md:text-xs text-[#666] mt-3">
                            By confirming, you agree to pay via the selected method.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );

    const renderStep5_Receipt = () => (
        <div className="max-w-3xl mx-auto animate-fade-in-up text-center">
            <div className="w-20 h-20 bg-[#4ADE80] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#4ADE80]/30">
                <Check size={40} className="text-[#0a0a0a]" />
            </div>

            <h2 className="text-4xl font-bold text-white font-proxima-sera mb-4">Order Placed!</h2>
            <p className="text-[#CCCCCC] mb-12 max-w-lg mx-auto">
                Your order has been recorded. Please complete your payment and send a screenshot to the email below to finalize.
            </p>

            <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-6">
                    <h3 className="font-bold text-white border-b border-[#252525] pb-2">What's Next?</h3>

                    {paymentMethod === 'paynow' ? (
                        <div className="bg-[#151515] p-6 rounded-2xl border border-[#252525]">
                            <div className="text-sm text-[#888888] mb-1">Send proof of payment to:</div>
                            <div className="font-mono text-[#4ADE80] text-sm break-all mb-4">shirish.pothi.27@nexus.edu.sg</div>

                            <p className="text-xs text-[#666]">
                                or julian.dizon.27@nexus.edu.sg
                            </p>
                        </div>
                    ) : (
                        <div className="bg-[#151515] p-6 rounded-2xl border border-[#252525]">
                            <p className="text-white font-medium mb-2">Meet up for Cash Payment</p>
                            <p className="text-sm text-[#888888]">
                                Find Shirish or Julian at school to pay. Your order is reserved.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button onClick={() => navigate("/")} variant="secondary" className="flex-1 bg-[#151515]">
                            <Home size={16} className="mr-2" /> Return Home
                        </Button>
                        <Button onClick={() => navigate("/about")} variant="secondary" className="flex-1 bg-[#151515]">
                            <BookOpen size={16} className="mr-2" /> Our Story
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white">Digital Receipt</h3>
                        <button onClick={handleDownloadReceipt} className="text-xs text-[#4ADE80] flex items-center gap-1 hover:underline">
                            <Download size={12} /> Download
                        </button>
                    </div>

                    <div className="relative">
                        {/* Spiral Notebook Receipt */}
                        <div
                            ref={receiptRef}
                            className="relative bg-[#fff9ea] text-[#2c3e50] p-0 font-handwriting shadow-2xl rounded-r-lg"
                            style={{
                                minHeight: '500px',
                                fontFamily: "'Indie Flower', 'Comic Sans MS', cursive",
                                borderRadius: '4px 12px 12px 4px',
                                background: 'linear-gradient(to bottom, #fff9ea 0%, #fff9ea 100%)',
                                boxShadow: '5px 5px 15px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Spiral Binding Holes */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#e6dbbf] border-r border-[#d1c4a5] flex flex-col justify-evenly py-4 z-10">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full bg-[#111] mx-auto opacity-80" style={{ background: 'radial-gradient(circle at 30% 30%, #444, #000)' }}></div>
                                ))}
                            </div>

                            {/* Spiral Rings - CSS representation */}
                            <div className="absolute left-[-6px] top-0 bottom-0 w-8 flex flex-col justify-evenly py-4 pointer-events-none z-20">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="w-8 h-2 bg-[#888] rounded-full transform rotate-[-15deg] shadow-sm ml-1" style={{ background: 'linear-gradient(to bottom, #ccc, #666, #ccc)' }}></div>
                                ))}
                            </div>

                            {/* Page Content Area (Lined Paper) */}
                            <div
                                className="pl-12 pr-6 py-8 h-full"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)',
                                    backgroundPosition: '0 8px'
                                }}
                            >
                                {/* Red Margin Line */}
                                <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-[#ef4444] opacity-50 h-full"></div>

                                <div className="text-center mb-6 pt-2">
                                    <h2 className="text-3xl font-bold text-[#1e293b]" style={{ fontFamily: 'serif' }}>PagePalette</h2>
                                    <div className="text-xs text-[#64748b]">Est. 2025 • Nexus School</div>
                                </div>

                                <div className="space-y-4 text-sm font-medium relative z-10" style={{ lineHeight: '32px' }}>
                                    <div className="flex justify-between border-b border-[#2c3e50]/20 pb-1">
                                        <span>Order #: <strong>{orderId}</strong></span>
                                        <span>{format(new Date(), "MMM dd")}</span>
                                    </div>

                                    <div>
                                        Hey <strong>{role === 'parent' ? formData.studentName : formData.name}</strong>, thanks for ordering!
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between items-baseline underline decoration-2 decoration-sky-200">
                                            <span>{selectedBundle.name}</span>
                                            <span>${selectedBundle.price}</span>
                                        </div>
                                        {extraSelections.map(e => (
                                            <div key={e.id} className="flex justify-between items-baseline text-[#64748b]">
                                                <span className="pl-4">+ {e.label}</span>
                                                <span>$3</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center text-xl font-bold text-[#1e293b] pt-4 border-t-2 border-[#1e293b] mt-4" style={{ lineHeight: '1.2' }}>
                                        <span>TOTAL</span>
                                        <div className="bg-[#fef3c7] px-2 py-1 transform rotate-[-2deg] shadow-sm border border-[#f59e0b]">${currentTotal}</div>
                                    </div>

                                    <div className="text-center pt-8 text-[#64748b] text-xs leading-tight">
                                        <p>Payment: {paymentMethod === 'paynow' ? 'PayNow' : 'Cash'}</p>
                                        <p className="mt-2">"An idea that is not dangerous is unworthy of being called an idea at all."</p>
                                        <p className="text-[10px] mt-1">— Oscar Wilde</p>
                                        <div className="mt-2 text-[10px] uppercase tracking-widest">--- End of Receipt ---</div>
                                    </div>
                                </div>

                                {/* Doodle / Sticker */}
                                <div className="absolute bottom-10 right-8 transform rotate-[-10deg] opacity-80 pointer-events-none">
                                    <div className="border-4 border-[#22c55e] rounded-full p-2 w-20 h-20 flex items-center justify-center text-[#22c55e] font-black text-xs uppercase text-center bg-white/50 backdrop-blur-sm">
                                        Verified Order
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden selection:bg-[#4ADE80] selection:text-[#0a0a0a]">
            {/* Background Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

            {/* Header - More compact on mobile */}
            <header className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-[#0f1115]/95 backdrop-blur-xl border-b border-[#1f1f1f] z-50 px-3 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={() => step > 1 ? setStep(step - 1) : navigate("/")} className="p-1.5 md:p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
                        <ArrowLeft size={18} className="text-[#888888]" />
                    </button>
                    <div>
                        <h1 className="text-sm md:text-lg font-bold font-proxima-sera leading-tight">
                            Step {step} of 5
                        </h1>
                        <p className="text-[10px] md:text-xs text-[#888888] font-light">
                            {step === 1 ? "Select Bundle" :
                                step === 2 ? "Customize" :
                                    step === 3 ? "Information" :
                                        step === 4 ? "Payment" : "Receipt"}
                        </p>
                    </div>
                </div>
                
                {/* Progress indicator on mobile */}
                <div className="flex items-center gap-1 md:hidden">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div 
                            key={s} 
                            className={`w-2 h-2 rounded-full transition-all ${s <= step ? 'bg-[#4ADE80]' : 'bg-[#333]'} ${s === step ? 'w-4' : ''}`}
                        />
                    ))}
                </div>
            </header>

            <div className="pt-16 md:pt-24 pb-8 md:pb-12 px-3 md:px-6 max-w-7xl mx-auto relative z-10" ref={mainContentRef}>
                {/* Progress Bar - Hidden on mobile (showing dots in header instead) */}
                <div className="hidden md:block max-w-md mx-auto h-1 bg-[#1f1f1f] rounded-full mb-12 overflow-hidden">
                    <div
                        className="h-full bg-[#4ADE80] transition-all duration-500 ease-out"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>

                {step === 1 && renderStep1_Bundles()}
                {step === 2 && renderStep2_Selection()}
                {step === 3 && renderStep3_Info()}
                {step === 4 && renderStep4_Payment()}
                {step === 5 && renderStep5_Receipt()}
            </div>
        </div>
    );
}
