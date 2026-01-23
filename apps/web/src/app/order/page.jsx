import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft, Check, Sparkles, CreditCard, Banknote, ShieldCheck, Mail,
    User, Briefcase, GraduationCap, School, ChevronRight, Package, ArrowRight,
    Download, Home, BookOpen, Leaf, Heart, Loader2
} from "lucide-react";
import { Button, Badge, Card, HoverBorderGradient } from "../../components/ui";
import { toPng } from "html-to-image";
import { format } from "date-fns";
import { postJSON } from "../../utils/api-utils";
import { useTurnstile } from "../../hooks/useTurnstile";

// Lazy load Stripe components to avoid SSR issues
const StripeCheckout = lazy(() => import("./StripeCheckout"));

// Feature flag for payments - set to false to disable payments
// Disabled as PagePalette JA Company liquidated on December 31, 2025
const PAYMENTS_ENABLED = false;

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
    { id: "nice", label: "Anxiety Rocks", color: "#14B8A6", emoji: "🪨" },
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

// --- Helper Component for Browse PagePals Card with Animated Border ---
function BrowsePagePalsCard({ onClick }) {
    return (
        <div className="mt-4 md:mt-6 max-w-4xl mx-auto">
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onClick();
                    }
                }}
                className="relative p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 group active:scale-[0.98] overflow-hidden bg-[#0f1115]/80 backdrop-blur-sm border border-[#252525] hover:border-[#4ADE80]/50 hover:bg-[#151515] focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
            >
                {/* Content */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-white font-proxima-sera mb-1">Browse PagePals</h3>
                        <p className="text-xs md:text-sm text-[#888888] font-montserrat">Explore our full collection • {STL_OPTIONS.length} designs</p>
                    </div>
                    <div className="text-2xl md:text-4xl ml-4">👀</div>
                </div>

                <HoverBorderGradient
                    containerClassName="w-full rounded-xl"
                    className="w-full py-2.5 text-center font-bold font-montserrat bg-[#1a1a1a] text-white text-sm"
                    duration={1}
                    intensity="normal"
                >
                    Browse Collection
                </HoverBorderGradient>
            </div>
        </div>
    );
}

// --- Main Component ---

export default function OrderPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const receiptRef = useRef(null);
    const mainContentRef = useRef(null);

    // Turnstile verification (runs once before order submission)
    const { verify: verifyTurnstile, isVerifying: isTurnstileVerifying, error: turnstileError, token: turnstileToken } = useTurnstile();

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

    // Form validation state
    const [formErrors, setFormErrors] = useState({});
    const [formTouched, setFormTouched] = useState({});

    // Handle bundle URL parameter (from homepage pricing cards)
    useEffect(() => {
        const bundleParam = searchParams.get('bundle');
        if (bundleParam) {
            const bundle = BUNDLES.find(b => b.id === bundleParam);
            if (bundle) {
                setSelectedBundle(bundle);
                setStep(2); // Skip to customization
            }
        }
    }, [searchParams]);

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
    const [role, setRole] = useState("student"); // student | parent | teacher | other
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
        // Other (non-school) Specific
        phone: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
    });

    // Browse mode state (view-only, no purchase)
    const [browseMode, setBrowseMode] = useState(false);

    // Check for browse mode from URL
    useEffect(() => {
        const browseParam = searchParams.get('browse');
        if (browseParam === 'true') {
            setBrowseMode(true);
            setStep(2); // Go directly to PagePals selection/view
        }
    }, [searchParams]);

    // Payment
    const [paymentMethod, setPaymentMethod] = useState("paynow"); // PayNow is default
    const [stripeClientSecret, setStripeClientSecret] = useState(null);
    const [stripeLoading, setStripeLoading] = useState(false);

    // Order Status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [orderId, setOrderId] = useState("");
    const [receiptUrl, setReceiptUrl] = useState(null);
    const [verificationFailed, setVerificationFailed] = useState(false); // Skip API calls if Turnstile failed

    // Check for Stripe return (after payment completion)
    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const status = searchParams.get('status');

        if (sessionId && status === 'complete') {
            // Fetch session details, process order (save to sheet, send emails), and show success
            fetch(`/api/checkout-session?session_id=${sessionId}&process_order=true`)
                .then(res => res.json())
                .then(data => {
                    if (data.payment_status === 'paid') {
                        setOrderId(data.metadata?.order_id || sessionId.slice(-8));
                        setPaymentMethod('card');
                        setStep(5); // Go to receipt
                    }
                })
                .catch(console.error);
        }
    }, [searchParams]);

    // Create Stripe checkout session when entering payment step with card selected
    const fetchClientSecret = useCallback(async () => {
        if (paymentMethod !== 'card') return null;

        const newOrderId = `PP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${format(new Date(), "MMdd")}`;
        setOrderId(newOrderId);

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bundleId: selectedBundle.id,
                    extraCount: extraSelections.length,
                    customerEmail: formData.email || undefined,
                    customerName: formData.name || undefined,
                    orderId: newOrderId,
                    orderMetadata: {
                        role: role,
                        items: ['Tree (Free)', ...bundleSelections.map(i => i.label), ...extraSelections.map(i => i.label)].join(', '),
                        student_name: formData.studentName || undefined,
                        student_email: formData.studentEmail || undefined,
                        year: formData.studentYear || undefined,
                        class: formData.studentClass || undefined,
                        position: formData.position || undefined,
                        room: formData.room || undefined,
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Checkout session error:', errorData);
                throw new Error(errorData.message || 'Failed to create checkout');
            }

            const data = await response.json();
            if (!data.clientSecret) {
                throw new Error('No client secret returned');
            }
            return data.clientSecret;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            setSubmitError('Unable to load payment form. Please try PayNow or Cash instead.');
            throw error;
        }
    }, [selectedBundle.id, extraSelections.length, formData.email, formData.name, role, bundleSelections, paymentMethod]);

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

    // Form validation
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!validateEmail(formData.email)) {
            errors.email = "Please enter a valid email";
        }
        if (role === 'parent') {
            if (!formData.studentName.trim()) errors.studentName = "Student name is required";
            if (!formData.studentEmail.trim()) {
                errors.studentEmail = "Student email is required";
            } else if (!validateEmail(formData.studentEmail)) {
                errors.studentEmail = "Please enter a valid email";
            }
        }
        if (role === 'other') {
            if (!formData.phone.trim()) errors.phone = "Phone number is required";
            if (!formData.addressLine1.trim()) errors.addressLine1 = "Address is required";
            if (!formData.postalCode.trim()) errors.postalCode = "Postal code is required";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFieldBlur = (field) => {
        setFormTouched(prev => ({ ...prev, [field]: true }));
    };

    const getFieldError = (field) => {
        return formTouched[field] && formErrors[field] ? formErrors[field] : null;
    };

    // --- Calculations ---

    const calculateTotal = () => {
        let total = selectedBundle.price;
        // Add extras
        total += extraSelections.length * 3;
        return total;
    };

    const currentTotal = calculateTotal();

    const handleKeyboardNext = () => {
        if (isSubmitting) return;
        switch (step) {
            case 1:
                setStep(2);
                return;
            case 2:
                if (browseMode) {
                    setStep(1);
                } else {
                    setStep(3);
                }
                return;
            case 15:
                if (isVerificationComplete) {
                    setStep(3);
                }
                return;
            case 3:
                if (validateForm()) {
                    setStep(4);
                } else {
                    setFormTouched({ name: true, email: true, studentName: true, studentEmail: true, phone: true, addressLine1: true, postalCode: true });
                }
                return;
            case 4:
                if (!PAYMENTS_ENABLED) {
                    handleSubmitOrder();
                    return;
                }
                if (paymentMethod !== 'card') {
                    handleSubmitOrder();
                }
                return;
            case 5:
            case 6:
            default:
                return;
        }
    };

    const handleGlobalKeyDown = useCallback((event) => {
        if (event.defaultPrevented) return;
        const target = event.target;
        const tagName = target?.tagName?.toLowerCase();
        const isEditable = target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
        if (event.key === 'Enter') {
            if (isEditable && tagName !== 'select') return;
            event.preventDefault();
            handleKeyboardNext();
        }
        if (event.key === 'ArrowRight' && !isEditable) {
            event.preventDefault();
            handleKeyboardNext();
        }
    }, [handleKeyboardNext]);

    useEffect(() => {
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleGlobalKeyDown]);

    // --- Handlers ---

    const handleBundleSelect = (bundle) => {
        const previousBundle = selectedBundle;
        setSelectedBundle(bundle);
        
        // If we have existing selections (e.g., from browse mode), redistribute them
        // based on the new bundle's free count instead of resetting
        const existingSelections = [...bundleSelections, ...extraSelections];
        
        if (existingSelections.length > 0) {
            // Redistribute: put items into bundle slots first, rest as extras
            const newBundleSelections = existingSelections.slice(0, bundle.freeCount);
            const newExtraSelections = existingSelections.slice(bundle.freeCount);
            setBundleSelections(newBundleSelections);
            setExtraSelections(newExtraSelections);
        } else if (previousBundle.id !== bundle.id) {
            // Only reset if switching between bundles with no existing selections
            setBundleSelections([]);
            setExtraSelections([]);
        }
        
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

    const handleSubmitOrder = async (skipNavigation = false) => {
        setIsSubmitting(true);
        setSubmitError(null);

        // Generate order ID upfront (needed for receipt even if verification fails)
        const newOrderId = `PP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${format(new Date(), "MMdd")}`;
        setOrderId(newOrderId);

        // Verify human with Turnstile before proceeding (runs once per session)
        let cfToken = turnstileToken;
        if (!cfToken && !verificationFailed) {
            try {
                cfToken = await verifyTurnstile();
            } catch (err) {
                // Verification failed - allow proceeding to receipt but skip API calls
                console.warn("Turnstile verification failed, proceeding without API calls");
                setVerificationFailed(true);
                setIsSubmitting(false);
                if (!skipNavigation) {
                    setStep(6); // Go to processing/receipt animation
                }
                return;
            }
        }

        // If verification previously failed, skip all API calls to avoid charges
        if (verificationFailed) {
            setIsSubmitting(false);
            if (!skipNavigation) {
                setStep(6);
            }
            return;
        }

        // Construct Item String
        const allItems = ["Tree (Free)", ...bundleSelections.map(i => i.label), ...extraSelections.map(i => `${i.label} (Extra)`)];
        const orderDate = new Date().toISOString().replace('T', ' ').split('.')[0];

        // Order data for SheetDB
        const orderData = {
            "Order ID": newOrderId,
            "Date": orderDate,
            "Order Type": "Order",
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
            "Phone": role === 'other' ? (formData.phone || "N/A") : "N/A",
            "Address": role === 'other' ? `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, Singapore ${formData.postalCode}` : "N/A",
            "Items": allItems.join(", "),
            "Total Amount": currentTotal.toFixed(2),
            "Payment Method": paymentMethod || "N/A",
            "Status": "Pending Payment"
        };

        try {
            // Call our API with retry logic for reliability
            const result = await postJSON("/api/order", {
                orderData,
                customerEmail: formData.email,
                customerName: formData.name,
                orderId: newOrderId,
                isDemo: !PAYMENTS_ENABLED,
                cfTurnstileToken: cfToken
            }, {
                retries: 3,
                timeout: 15000, // 15 second timeout for order API
            });

            if (!result.success) {
                console.error("Order API Error:", result.error);
                setSubmitError(result.error || "Failed to submit order. Please try again.");
                // If skipNavigation, caller handles it; otherwise proceed with delay
                if (!skipNavigation) {
                    setTimeout(() => setStep(6), 2000);
                }
                return;
            }

            // Move to animation step (then to receipt) unless caller handles navigation
            if (!skipNavigation) {
                setStep(6);
            }
        } catch (err) {
            console.error("Order Submission Failed", err);
            setSubmitError("Failed to submit order. Please check your connection and try again.");
            // If skipNavigation, caller handles it; otherwise proceed with delay
            if (!skipNavigation) {
                setTimeout(() => setStep(6), 2000);
            }
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
        <div className="space-y-4 md:space-y-4 animate-fade-in-up">
            <div className="text-center mb-4 md:mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera mb-1 md:mb-2">Choose Your Bundle</h2>
                <p className="text-sm md:text-base text-[#888888] font-montserrat mb-2 md:mb-3">Select standard or customization package</p>

                {/* Social Proof - Hidden on very small screens for space */}
                <div className="hidden sm:flex items-center justify-center gap-2 mb-3 md:mb-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-[#4ADE80] to-[#36484d] border-2 border-[#0a0a0a] flex items-center justify-center text-xs">🎒</div>
                        ))}
                    </div>
                </div>

                <picture>
                    <source type="image/png" srcSet="/logo-full-256.png 256w, /logo-full-320.png 320w" sizes="(max-width: 768px) 160px, 192px" />
                    <img
                        src="/logo-full-256.png"
                        alt="PagePalette"
                        className="h-10 md:h-12 w-auto mx-auto object-contain opacity-80"
                        loading="lazy"
                        decoding="async"
                        width="192"
                        height="48"
                    />
                </picture>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 max-w-4xl mx-auto">
                {BUNDLES.map(bundle => (
                    <div
                        key={bundle.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleBundleSelect(bundle)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleBundleSelect(bundle);
                            }
                        }}
                        className={`
                relative p-4 md:p-6 rounded-2xl border cursor-pointer transition-all duration-300 group backdrop-blur-sm flex flex-col overflow-hidden active:scale-[0.98]
                ${bundle.id === 'complete'
                                    ? "bg-gradient-to-br from-[#36484d]/30 to-[#2a3a40]/20 border-[#4ADE80] shadow-lg shadow-[#4ADE80]/20"
                                    : selectedBundle.id === bundle.id
                                        ? "bg-[#36484d]/20 border-[#4ADE80] shadow-lg shadow-[#4ADE80]/10"
                                        : "bg-[#0f1115]/80 border-[#252525] hover:border-[#4ADE80]/50 hover:bg-[#151515]"}
                focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]`}
                    >
                        {/* Best Value Badge for Complete Bundle - positioned in corner with proper offset */}
                        {bundle.id === 'complete' && (
                            <div className="absolute -top-px -right-px z-10">
                                <div className="relative">
                                    {/* Animated glow background */}
                                    <div className="absolute inset-0 bg-[#4ADE80] blur-lg opacity-40 animate-max-pulse" />
                                    {/* Main badge */}
                                    <div className="relative bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] px-2 py-0.5 md:px-3 md:py-1 rounded-bl-lg rounded-tr-2xl border-l border-b border-[#4ADE80]/50">
                                        <span className="font-bold text-[10px] md:text-xs tracking-wide text-white animate-max-shimmer bg-gradient-to-r from-white via-[#4ADE80] to-white bg-[length:200%_100%] bg-clip-text [-webkit-text-fill-color:transparent] whitespace-nowrap">
                                            BEST VALUE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Add top padding for complete bundle to make room for badge */}
                        <div className={`flex items-center justify-between mb-2 ${bundle.id === 'complete' ? 'mt-3 md:mt-2' : ''}`}>
                            <h3 className="text-xl md:text-2xl font-bold text-white font-proxima-sera">{bundle.name}</h3>
                            <span className="text-2xl md:text-3xl font-bold text-[#4ADE80] font-proxima-sera">${bundle.price}</span>
                        </div>

                        <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4 flex-1">
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

                        <HoverBorderGradient
                            containerClassName="w-full rounded-xl mt-auto"
                            className="w-full py-2.5 text-center font-bold font-montserrat bg-[#1a1a1a] text-white text-sm"
                            duration={1}
                            intensity="normal"
                        >
                            Select {bundle.name}
                        </HoverBorderGradient>
                    </div>
                ))}
            </div>

            {/* Browse PagePals Option with Animated Border - More compact on desktop */}
            <BrowsePagePalsCard onClick={() => {
                setBrowseMode(true);
                setStep(2);
            }} />

            {/* Minimal eco-friendly indicator */}
            <div className="mt-3 md:mt-4 flex items-center justify-center gap-2 text-xs md:text-sm text-[#666] font-montserrat">
                <Leaf size={14} className="text-[#4ADE80]" />
                <span>Eco-Friendly Materials</span>
            </div>
        </div>
    );

    const renderStep15_Verification = () => (
        <div className="animate-fade-in-up max-w-3xl mx-auto">
            <div className="glass p-4 md:p-8 rounded-2xl md:rounded-3xl border border-[#36484d]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 md:p-4 opacity-50">
                    <span className="text-4xl md:text-6xl" role="img" aria-label="Checking">🧐</span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 font-proxima-sera">Let's double check!</h2>
                <p className="text-sm md:text-base text-[#888] mb-4 md:mb-6 font-montserrat">
                    Tap each item to confirm your selection.
                </p>

                <div className="flex justify-end mb-3 md:mb-4">
                    <button
                        onClick={confirmAll}
                        className="text-xs text-[#4ADE80] underline hover:text-white transition-colors py-2 px-3"
                        aria-label="Select all items"
                    >
                        Select All
                    </button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
                    {allImportedItems.map((item, idx) => {
                        const isConfirmed = confirmedItems.includes(item.id);
                        return (
                            <button
                                key={`${item.id}-${idx}`}
                                onClick={() => toggleConfirmation(item.id)}
                                aria-pressed={isConfirmed}
                                aria-label={`${item.label} - ${isConfirmed ? 'confirmed' : 'tap to confirm'}`}
                                className={`relative p-2 md:p-4 rounded-xl border-2 transition-all duration-200 min-h-[80px] md:min-h-[100px] active:scale-95 ${isConfirmed
                                    ? "bg-[#4ADE80]/10 border-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                                    : "bg-[#151515] border-[#333] opacity-60 hover:opacity-100"
                                    }`}
                            >
                                <div className="text-2xl md:text-4xl mb-1 md:mb-2 filter drop-shadow-md">{item.emoji}</div>
                                <div className="text-[10px] md:text-sm font-bold text-white leading-tight">{item.label}</div>
                                {isConfirmed && (
                                    <div className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-5 md:h-5 bg-[#4ADE80] rounded-full flex items-center justify-center">
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
                <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera mb-1 md:mb-2">
                    {browseMode ? "Browse PagePals" : "Customize Your Palette"}
                </h2>
                <p className="text-sm md:text-base text-[#888888] font-montserrat">
                    {browseMode 
                        ? "Explore our full collection of PagePal designs"
                        : selectedBundle.freeCount > 0
                            ? `Choose your ${selectedBundle.freeCount} included PagePals`
                            : "Add extra PagePals to your order"}
                </p>
            </div>

            {/* Mobile: Summary card at top for visibility - hide in browse mode */}
            {!browseMode && (
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
            )}

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

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 md:gap-4" role="group" aria-label="PagePal selection">
                            {STL_OPTIONS.filter(o => o.id !== 'tree').map(item => {
                                const status = getSelectionStatus(item);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleSelection(item)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleSelection(item);
                                            }
                                        }}
                                        aria-pressed={status !== 'none'}
                                        aria-label={`${item.label} - ${status === 'bundle' ? 'Free included' : status === 'extra' ? 'Extra $3' : 'Not selected'}`}
                                        className={`
                        relative p-2 md:p-4 rounded-xl border text-left transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]
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

                {/* Right: Summary Sticky - Hidden on mobile and in browse mode */}
                {!browseMode && (
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
                            <HoverBorderGradient
                                containerClassName="w-full rounded-xl"
                                className="w-full py-3 text-center font-bold font-montserrat bg-[#1a1a1a] text-white flex items-center justify-center gap-2"
                                duration={0.8}
                                intensity="strong"
                                onClick={() => setStep(3)}
                            >
                                Next: Your Details <ChevronRight size={16} />
                            </HoverBorderGradient>
                            <Button className="w-full" variant="ghost" onClick={() => setStep(1)}>
                                Back to Bundles
                            </Button>
                        </div>
                    </Card>
                </div>
                )}

                {/* Browse mode sidebar */}
                {browseMode && (
                <div className="hidden lg:block space-y-6">
                    <Card className="p-6 bg-[#0f1115] border-[#1f1f1f] sticky top-24">
                        <h3 className="font-bold text-white mb-4">PagePal Collection</h3>
                        <p className="text-sm text-[#888888] mb-4">
                            {bundleSelections.length + extraSelections.length > 0 
                                ? `${bundleSelections.length + extraSelections.length} PagePal${bundleSelections.length + extraSelections.length > 1 ? 's' : ''} selected. Click "Start Order" to continue with your selection!`
                                : `Browse our full collection of ${STL_OPTIONS.length} unique PagePal designs. Tap to select your favorites!`}
                        </p>
                        {bundleSelections.length + extraSelections.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {[...bundleSelections, ...extraSelections].map(item => (
                                    <div key={item.id} className="flex items-center gap-1 bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-lg px-2 py-1 text-xs">
                                        <span>{item.emoji}</span>
                                        <span className="text-[#4ADE80]">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="space-y-2">
                            <HoverBorderGradient
                                containerClassName="w-full rounded-xl"
                                className="w-full py-3 text-center font-bold font-montserrat bg-[#1a1a1a] text-white flex items-center justify-center gap-2"
                                duration={0.8}
                                intensity="strong"
                                onClick={() => {
                                    setBrowseMode(false);
                                    setStep(1);
                                }}
                            >
                                Start Order {bundleSelections.length + extraSelections.length > 0 && `(${bundleSelections.length + extraSelections.length} selected)`} <ArrowRight size={16} />
                            </HoverBorderGradient>
                            <Button className="w-full" variant="ghost" onClick={() => navigate("/")}>
                                Back to Home
                            </Button>
                        </div>
                    </Card>
                </div>
                )}
            </div>

            {/* Mobile: Fixed bottom bar for navigation with safe area - hide in browse mode */}
            {!browseMode && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1115]/95 backdrop-blur-xl border-t border-[#1f1f1f] p-4 z-40" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
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
            )}
            
            {/* Browse mode mobile bottom bar */}
            {browseMode && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1115]/95 backdrop-blur-xl border-t border-[#1f1f1f] p-4 z-40" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
                <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex-shrink-0">
                        <ArrowLeft size={16} /> Home
                    </Button>
                    <div className="text-center">
                        <div className="text-xs text-[#888888]">
                            {bundleSelections.length + extraSelections.length > 0 
                                ? `${bundleSelections.length + extraSelections.length} selected`
                                : `${STL_OPTIONS.length} designs`}
                        </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => { setBrowseMode(false); setStep(1); }} className="flex-shrink-0">
                        Order <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
            )}
            {/* Spacer for fixed bottom bar on mobile - account for safe area */}
            <div className="lg:hidden h-24" />
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
                <div className="grid grid-cols-4 gap-2 md:gap-3" role="radiogroup" aria-label="Customer role">
                    {[
                        { id: 'student', icon: GraduationCap, label: 'Student' },
                        { id: 'parent', icon: User, label: 'Parent' },
                        { id: 'teacher', icon: Briefcase, label: 'Teacher' },
                        { id: 'other', icon: Home, label: 'Personal' }
                    ].map(r => (
                        <button
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setRole(r.id);
                                }
                            }}
                            role="radio"
                            aria-checked={role === r.id}
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
                            <label htmlFor="name" className="text-xs font-bold text-[#666] uppercase">
                                {role === 'parent' ? "Parent Name" : "Name"} <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                onBlur={() => handleFieldBlur('name')}
                                className={`w-full bg-[#151515] border rounded-xl px-4 py-3.5 text-base outline-none text-white transition-colors ${getFieldError('name') ? 'border-red-400 focus:border-red-400' : 'border-[#252525] focus:border-[#4ADE80]'}`}
                                placeholder="Full Name"
                                aria-invalid={!!getFieldError('name')}
                                aria-describedby={getFieldError('name') ? 'name-error' : undefined}
                            />
                            {getFieldError('name') && (
                                <p id="name-error" className="text-xs text-red-400 mt-1">{getFieldError('name')}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-xs font-bold text-[#666] uppercase">
                                {role === 'parent' ? "Parent Email" : "Email"} <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="email"
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                onBlur={() => handleFieldBlur('email')}
                                className={`w-full bg-[#151515] border rounded-xl px-4 py-3.5 text-base outline-none text-white transition-colors ${getFieldError('email') ? 'border-red-400 focus:border-red-400' : 'border-[#252525] focus:border-[#4ADE80]'}`}
                                placeholder="your.email@nexus.edu.sg"
                                aria-invalid={!!getFieldError('email')}
                                aria-describedby={getFieldError('email') ? 'email-error' : undefined}
                            />
                            {getFieldError('email') && (
                                <p id="email-error" className="text-xs text-red-400 mt-1">{getFieldError('email')}</p>
                            )}
                        </div>
                    </div>

                    {/* Parent Specific */}
                    {role === 'parent' && (
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[#252525]">
                            <div className="space-y-1">
                                <label htmlFor="studentName" className="text-xs font-bold text-[#666] uppercase">Student Name <span className="text-red-400">*</span></label>
                                <input
                                    id="studentName"
                                    required
                                    value={formData.studentName}
                                    onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                                    onBlur={() => handleFieldBlur('studentName')}
                                    className={`w-full bg-[#151515] border rounded-xl px-4 py-3.5 text-base outline-none text-white transition-colors ${getFieldError('studentName') ? 'border-red-400' : 'border-[#252525] focus:border-[#4ADE80]'}`}
                                    placeholder="Child's Name"
                                />
                                {getFieldError('studentName') && (
                                    <p className="text-xs text-red-400 mt-1">{getFieldError('studentName')}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="studentEmail" className="text-xs font-bold text-[#666] uppercase">Student Email <span className="text-red-400">*</span></label>
                                <input
                                    id="studentEmail"
                                    required
                                    type="email"
                                    value={formData.studentEmail}
                                    onChange={e => setFormData({ ...formData, studentEmail: e.target.value })}
                                    onBlur={() => handleFieldBlur('studentEmail')}
                                    className={`w-full bg-[#151515] border rounded-xl px-4 py-3.5 text-base outline-none text-white transition-colors ${getFieldError('studentEmail') ? 'border-red-400' : 'border-[#252525] focus:border-[#4ADE80]'}`}
                                    placeholder="Child's school email"
                                />
                                {getFieldError('studentEmail') && (
                                    <p className="text-xs text-red-400 mt-1">{getFieldError('studentEmail')}</p>
                                )}
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

                    {/* Personal (Non-School) Specific */}
                    {role === 'other' && (
                        <div className="space-y-4 pt-4 border-t border-[#252525]">
                            <div className="bg-[#4ADE80]/5 border border-[#4ADE80]/20 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck size={20} className="text-[#4ADE80] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-white font-medium mb-1">Your information is safe with us</p>
                                        <p className="text-xs text-[#888888]">We collect contact details only for delivery coordination. Your information is handled securely and never shared with third parties.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-[#666] uppercase">Phone Number <span className="text-red-400">*</span></label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        onBlur={() => handleFieldBlur('phone')}
                                        className={`w-full bg-[#151515] border rounded-xl px-4 py-3 text-sm outline-none text-white ${getFieldError('phone') ? 'border-red-400 focus:border-red-400' : 'border-[#252525] focus:border-[#4ADE80]'}`}
                                        placeholder="+65 XXXX XXXX"
                                        type="tel"
                                    />
                                    {getFieldError('phone') && <p className="text-xs text-red-400">{getFieldError('phone')}</p>}
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-[#666] uppercase">Address Line 1 <span className="text-red-400">*</span></label>
                                    <input
                                        value={formData.addressLine1}
                                        onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                                        onBlur={() => handleFieldBlur('addressLine1')}
                                        className={`w-full bg-[#151515] border rounded-xl px-4 py-3 text-sm outline-none text-white ${getFieldError('addressLine1') ? 'border-red-400 focus:border-red-400' : 'border-[#252525] focus:border-[#4ADE80]'}`}
                                        placeholder="Street address, block, unit number"
                                    />
                                    {getFieldError('addressLine1') && <p className="text-xs text-red-400">{getFieldError('addressLine1')}</p>}
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-[#666] uppercase">Address Line 2</label>
                                    <input
                                        value={formData.addressLine2}
                                        onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                                        className="w-full bg-[#151515] border border-[#252525] rounded-xl px-4 py-3 text-sm focus:border-[#4ADE80] outline-none text-white"
                                        placeholder="Building name, floor, etc. (optional)"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#666] uppercase">Postal Code <span className="text-red-400">*</span></label>
                                    <input
                                        value={formData.postalCode}
                                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                        onBlur={() => handleFieldBlur('postalCode')}
                                        className={`w-full bg-[#151515] border rounded-xl px-4 py-3 text-sm outline-none text-white ${getFieldError('postalCode') ? 'border-red-400 focus:border-red-400' : 'border-[#252525] focus:border-[#4ADE80]'}`}
                                        placeholder="e.g. 123456"
                                    />
                                    {getFieldError('postalCode') && <p className="text-xs text-red-400">{getFieldError('postalCode')}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex gap-3 md:gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1" aria-label="Go back to customization">
                        Back
                    </Button>
                    <HoverBorderGradient
                        containerClassName="flex-[2] rounded-xl"
                        className="w-full py-3 text-center font-bold font-montserrat bg-[#1a1a1a] text-white"
                        duration={0.8}
                        intensity="strong"
                        onClick={() => {
                            if (validateForm()) {
                                setStep(4);
                            } else {
                                setFormTouched({ name: true, email: true, studentName: true, studentEmail: true, phone: true, addressLine1: true, postalCode: true });
                            }
                        }}
                        aria-label="Proceed to payment"
                    >
                        Proceed to Payment
                    </HoverBorderGradient>
                </div>

            </div>
        </div>
    );

    const renderStep4_Payment = () => {
        if (!PAYMENTS_ENABLED) {
            return (
                <div className="max-w-2xl mx-auto animate-fade-in-up text-center">
                    <div className="bg-[#0f1115] border border-[#1f1f1f] rounded-2xl p-8 md:p-12">
                        {/* Demo Notice */}
                        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 mb-6">
                            <p className="text-[#F59E0B] font-bold text-sm mb-1">📋 Demo Mode</p>
                            <p className="text-xs text-[#F59E0B]/80">
                                PagePalette concluded operations on December 31, 2025 as a JA Singapore company. This is a demo order flow.
                            </p>
                        </div>
                        
                        <div className="w-16 h-16 bg-[#36484d]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={32} className="text-[#4ADE80]" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera mb-4">Review Your Order</h2>
                        <p className="text-[#888888] font-montserrat mb-6 leading-relaxed">
                            You can see your complete order summary below. Continue to view your digital receipt!
                        </p>
                        {(submitError || turnstileError) && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 text-center mb-4">
                                {submitError || turnstileError}
                            </div>
                        )}
                        <HoverBorderGradient
                            containerClassName="w-full rounded-xl"
                            className="w-full px-8 py-3 text-center font-bold font-montserrat bg-[#1a1a1a] text-white flex items-center justify-center gap-2"
                            duration={1}
                            intensity="normal"
                            onClick={() => handleSubmitOrder()}
                            disabled={isSubmitting || isTurnstileVerifying}
                        >
                            {isSubmitting || isTurnstileVerifying ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>{isTurnstileVerifying ? 'Verifying...' : 'Processing...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>View Receipt</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </HoverBorderGradient>
                    </div>
                </div>
            );
        }

        return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="grid md:grid-cols-[1fr_320px] gap-4 md:gap-8">
                {/* Left: Methods */}
                <div className="space-y-4 md:space-y-6">
                    <div className="mb-2 md:mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-white font-proxima-sera">Payment</h2>
                        <p className="text-sm md:text-base text-[#888888]">Choose a payment method</p>
                    </div>

                    <div className="space-y-3 md:space-y-4" role="radiogroup" aria-label="Payment method">
                        {/* PayNow QR Option - Default */}
                        <div
                            role="radio"
                            tabIndex={0}
                            aria-checked={paymentMethod === 'paynow'}
                            onClick={() => setPaymentMethod('paynow')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setPaymentMethod('paynow');
                                }
                            }}
                            className={`p-4 md:p-6 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${paymentMethod === 'paynow' ? 'bg-[#4ADE80]/5 border-[#4ADE80] ring-1 ring-[#4ADE80]' : 'bg-[#0f1115] border-[#252525] hover:bg-[#151515]'} focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]`}
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'paynow' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-[#666]'}`}>
                                    {paymentMethod === 'paynow' && <Check size={12} className="text-black" />}
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-white">PayNow Transfer</h3>
                                <Badge variant="primary" size="sm" className="ml-auto bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30">
                                    Recommended
                                </Badge>
                            </div>

                            {paymentMethod === 'paynow' && (
                                <div className="mt-4 space-y-4 animate-fade-in">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-xl mx-auto sm:mx-0 flex-shrink-0">
                                            <picture>
                                                <source
                                                    type="image/webp"
                                                    srcSet="/paynow-qr-256.webp 256w, /paynow-qr-320.webp 320w"
                                                    sizes="(max-width: 768px) 128px, 160px"
                                                />
                                                <source
                                                    type="image/jpeg"
                                                    srcSet="/paynow-qr-256.jpg 256w, /paynow-qr-320.jpg 320w"
                                                    sizes="(max-width: 768px) 128px, 160px"
                                                />
                                                <img
                                                    src="/paynow-qr-256.jpg"
                                                    alt="QR"
                                                    className="w-full h-full object-contain"
                                                    loading="lazy"
                                                    decoding="async"
                                                    width="160"
                                                    height="160"
                                                />
                                            </picture>
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

                        {/* Card Payment Option - Stripe Embedded Checkout */}
                        <div
                            role="radio"
                            tabIndex={0}
                            aria-checked={paymentMethod === 'card'}
                            onClick={() => setPaymentMethod('card')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setPaymentMethod('card');
                                }
                            }}
                            className={`p-4 md:p-6 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${paymentMethod === 'card' ? 'bg-[#4ADE80]/5 border-[#4ADE80] ring-1 ring-[#4ADE80]' : 'bg-[#0f1115] border-[#252525] hover:bg-[#151515]'} focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]`}
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'card' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-[#666]'}`}>
                                    {paymentMethod === 'card' && <Check size={12} className="text-black" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard size={18} className="text-[#4ADE80]" />
                                    <h3 className="text-base md:text-lg font-bold text-white">Pay with Card</h3>
                                </div>
                                <Badge variant="outline" size="sm" className="ml-auto bg-[#0a0a0a] text-[#888] border-[#333] flex items-center gap-1">
                                    <ShieldCheck size={10} className="text-[#4ADE80]" />
                                    Secured by Stripe
                                </Badge>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-4 animate-fade-in">
                                    <div className="bg-[#0a0a0a] rounded-xl overflow-hidden min-h-[400px]">
                                        <Suspense fallback={
                                            <div className="flex items-center justify-center min-h-[400px]">
                                                <div className="text-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-[#4ADE80] mx-auto mb-3" />
                                                    <p className="text-sm text-[#888]">Loading secure payment...</p>
                                                </div>
                                            </div>
                                        }>
                                            <StripeCheckout fetchClientSecret={fetchClientSecret} />
                                        </Suspense>
                                    </div>
                                    <p className="text-xs text-[#666] mt-3 text-center flex items-center justify-center gap-1">
                                        <ShieldCheck size={12} className="text-[#4ADE80]" />
                                        Secured by Stripe. Supports Credit/Debit Cards, PayNow & GrabPay.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Cash Option */}
                        <div
                            role="radio"
                            tabIndex={0}
                            aria-checked={paymentMethod === 'cash'}
                            onClick={() => setPaymentMethod('cash')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setPaymentMethod('cash');
                                }
                            }}
                            className={`p-4 md:p-6 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${paymentMethod === 'cash' ? 'bg-[#4ADE80]/5 border-[#4ADE80] ring-1 ring-[#4ADE80]' : 'bg-[#0f1115] border-[#252525] hover:bg-[#151515]'} focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]`}
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

                        {/* Only show submit button for non-card payment methods */}
                        {paymentMethod !== 'card' && (
                            <div className="space-y-2 md:space-y-3">
                                {submitError && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 text-center mb-2">
                                        {submitError}
                                    </div>
                                )}
                                <Button
                                    className="w-full"
                                    size="lg"
                                    variant="primary"
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>Confirm Order <ArrowRight size={16} /></>
                                    )}
                                </Button>
                            </div>
                        )}

                        {paymentMethod === 'card' && (
                            <div className="space-y-2">
                                <p className="text-xs text-[#888] text-center">
                                    Complete payment using the form on the left
                                </p>
                                <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0a0a0a] rounded-lg border border-[#252525]">
                                    <ShieldCheck size={14} className="text-[#4ADE80]" />
                                    <span className="text-xs text-[#888]">Payment secured by</span>
                                    <span className="text-xs font-bold text-white">Stripe</span>
                                </div>
                            </div>
                        )}

                        <Button className="w-full mt-3" variant="ghost" size="sm" onClick={() => setStep(3)} aria-label="Go back to details">
                            Back to Details
                        </Button>

                        <p className="text-center text-[10px] md:text-xs text-[#666] mt-3">
                            By confirming, you agree to pay via the selected method.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
        );
    };

    // Auto-advance from processing step after animation completes
    useEffect(() => {
        if (step === 6) {
            const timer = setTimeout(() => setStep(5), 2500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Processing step with notebook page-turn transition
    const renderStep6_Processing = () => {
        return (
            <div className="max-w-md mx-auto text-center py-16">
                {/* Notebook page-turn animation container */}
                <div className="relative w-64 h-80 mx-auto mb-8 perspective-1000">
                    {/* Book spine */}
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#36484d] to-[#2a3a40] rounded-l-lg shadow-lg z-10" />
                    
                    {/* Back page (static) */}
                    <div className="absolute inset-0 ml-4 bg-[#fff9ea] rounded-r-lg shadow-xl">
                        <div className="p-6 h-full flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-[#4ADE80] rounded-full flex items-center justify-center mb-4">
                                <Check size={24} className="text-black" />
                            </div>
                            <p className="text-[#2c3e50] font-bold text-lg">Ready!</p>
                        </div>
                    </div>
                    
                    {/* Front page (animating) */}
                    <div 
                        className="absolute inset-0 ml-4 bg-[#fff9ea] rounded-r-lg shadow-2xl origin-left"
                        style={{
                            animation: 'pageTurn 1.8s ease-in-out forwards',
                            animationDelay: '0.5s',
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden'
                        }}
                    >
                        {/* Lined paper effect */}
                        <div 
                            className="absolute inset-0 p-6"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #94a3b8 27px, #94a3b8 28px)',
                                backgroundPosition: '0 20px'
                            }}
                        >
                            {/* Red margin */}
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-[#ef4444]/50" />
                            
                            {/* PagePalette branding */}
                            <div className="text-center pt-8">
                                <h3 className="text-[#2c3e50] font-bold text-xl mb-2" style={{ fontFamily: 'serif' }}>PagePalette</h3>
                                <Leaf className="text-[#4ADE80] w-8 h-8 mx-auto mb-4" />
                            </div>
                            
                            <div className="space-y-4 mt-8">
                                <div className="h-3 bg-[#e2e8f0] rounded w-3/4 mx-auto" />
                                <div className="h-3 bg-[#e2e8f0] rounded w-1/2 mx-auto" />
                                <div className="h-3 bg-[#e2e8f0] rounded w-2/3 mx-auto" />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Loading text */}
                <div className="space-y-3">
                    <p className="text-white font-proxima-sera text-xl font-bold">Preparing your receipt...</p>
                    <div className="flex items-center justify-center gap-1">
                        {[0, 1, 2].map(i => (
                            <div 
                                key={i}
                                className="w-2 h-2 bg-[#4ADE80] rounded-full"
                                style={{
                                    animation: 'bounce 1s infinite',
                                    animationDelay: `${i * 0.15}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
                
                {/* CSS Animations */}
                <style>{`
                    .perspective-1000 {
                        perspective: 1000px;
                    }
                    @keyframes pageTurn {
                        0% {
                            transform: rotateY(0deg);
                            box-shadow: 5px 5px 20px rgba(0,0,0,0.3);
                        }
                        50% {
                            box-shadow: 20px 10px 30px rgba(0,0,0,0.2);
                        }
                        100% {
                            transform: rotateY(-160deg);
                            box-shadow: -5px 5px 20px rgba(0,0,0,0.1);
                        }
                    }
                    @keyframes bounce {
                        0%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-8px);
                        }
                    }
                `}</style>
            </div>
        );
    };

    const renderStep5_Receipt = () => {
        const isDemo = !PAYMENTS_ENABLED;

        return (
        <div className="max-w-3xl mx-auto animate-fade-in-up text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#4ADE80] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl shadow-[#4ADE80]/30">
                <Check size={32} className="text-[#0a0a0a]" />
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-white font-proxima-sera mb-2 md:mb-4">
                Order Complete!
            </h2>
            <p className="text-sm md:text-base text-[#CCCCCC] mb-6 md:mb-12 max-w-lg mx-auto px-2">
                {isDemo 
                    ? "Your digital receipt is below. Check your email for confirmation!"
                    : "Complete your payment and send a screenshot to finalize your order."}
            </p>

            <div className="grid md:grid-cols-2 gap-4 md:gap-8 text-left">
                <div className="space-y-4 md:space-y-6">
                    <h3 className="font-bold text-white border-b border-[#252525] pb-2 text-sm md:text-base">
                        {isDemo ? "About PagePalette" : "What's Next?"}
                    </h3>

                    {isDemo ? (
                        <div className="bg-[#151515] p-4 md:p-6 rounded-2xl border border-[#252525]">
                            <p className="text-white font-medium mb-2 text-sm md:text-base">Our Story</p>
                            <p className="text-xs md:text-sm text-[#888888]">
                                PagePalette was a Junior Achievement Singapore student company creating sustainable notebooks with 3D-printed PagePal accessories.
                            </p>
                        </div>
                    ) : paymentMethod === 'paynow' ? (
                        <div className="bg-[#151515] p-4 md:p-6 rounded-2xl border border-[#252525]">
                            <div className="text-xs md:text-sm text-[#888888] mb-1">Send proof of payment to:</div>
                            <div className="font-mono text-[#4ADE80] text-xs md:text-sm break-all mb-3 md:mb-4">shirish.pothi.27@nexus.edu.sg</div>

                            <p className="text-[10px] md:text-xs text-[#666]">
                                or julian.dizon.27@nexus.edu.sg
                            </p>
                        </div>
                    ) : (
                        <div className="bg-[#151515] p-4 md:p-6 rounded-2xl border border-[#252525]">
                            <p className="text-white font-medium mb-2 text-sm md:text-base">Meet up for Cash Payment</p>
                            <p className="text-xs md:text-sm text-[#888888]">
                                Find Shirish or Julian at school to pay.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 md:gap-4">
                        <Button onClick={() => navigate("/")} variant="secondary" size="sm" className="flex-1 bg-[#151515] text-xs md:text-sm" aria-label="Return to home page">
                            <Home size={14} className="mr-1 md:mr-2" /> Home
                        </Button>
                        <Button onClick={() => navigate("/about")} variant="secondary" size="sm" className="flex-1 bg-[#151515] text-xs md:text-sm" aria-label="Read our story">
                            <BookOpen size={14} className="mr-1 md:mr-2" /> Our Story
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                        <h3 className="font-bold text-white text-sm md:text-base">Digital Receipt</h3>
                        <button onClick={handleDownloadReceipt} className="text-xs text-[#4ADE80] flex items-center gap-1 hover:underline py-2" aria-label="Download receipt as image">
                            <Download size={12} /> Download
                        </button>
                    </div>

                    {/* Simple mobile receipt - hide spiral on small screens */}
                    <div className="relative overflow-hidden rounded-xl">
                        <div
                            ref={receiptRef}
                            className="relative bg-[#fff9ea] text-[#2c3e50] font-handwriting shadow-2xl rounded-lg md:rounded-r-lg"
                            style={{
                                minHeight: '400px',
                                fontFamily: "'Indie Flower', 'Comic Sans MS', cursive",
                                borderRadius: '8px',
                                background: 'linear-gradient(to bottom, #fff9ea 0%, #fff9ea 100%)',
                                boxShadow: '5px 5px 15px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Spiral Binding Holes - Hidden on mobile for cleaner look */}
                            <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-8 bg-[#e6dbbf] border-r border-[#d1c4a5] flex-col justify-evenly py-4 z-10">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full bg-[#111] mx-auto opacity-80" style={{ background: 'radial-gradient(circle at 30% 30%, #444, #000)' }}></div>
                                ))}
                            </div>

                            {/* Spiral Rings - Hidden on mobile */}
                            <div className="hidden md:flex absolute left-[-6px] top-0 bottom-0 w-8 flex-col justify-evenly py-4 pointer-events-none z-20">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="w-8 h-2 bg-[#888] rounded-full transform rotate-[-15deg] shadow-sm ml-1" style={{ background: 'linear-gradient(to bottom, #ccc, #666, #ccc)' }}></div>
                                ))}
                            </div>

                            {/* Page Content Area (Lined Paper) */}
                            <div
                                className="px-4 md:pl-12 md:pr-6 py-6 md:py-8 h-full"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #94a3b8 27px, #94a3b8 28px)',
                                    backgroundPosition: '0 8px'
                                }}
                            >
                                {/* Red Margin Line - Only on desktop */}
                                <div className="hidden md:block absolute left-10 top-0 bottom-0 w-[1px] bg-[#ef4444] opacity-50 h-full"></div>

                                <div className="text-center mb-4 md:mb-6 pt-2">
                                    <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]" style={{ fontFamily: 'serif' }}>PagePalette</h2>
                                    <div className="text-[10px] md:text-xs text-[#64748b]">Est. 2025 • Nexus School</div>
                                </div>

                                <div className="space-y-3 md:space-y-4 text-xs md:text-sm font-medium relative z-10" style={{ lineHeight: '28px' }}>
                                    <div className="flex justify-between border-b border-[#2c3e50]/20 pb-1 text-[11px] md:text-sm">
                                        <span>Order #: <strong>{orderId}</strong></span>
                                        <span>{format(new Date(), "MMM dd")}</span>
                                    </div>

                                    <div className="text-xs md:text-sm">
                                        Hey <strong>{role === 'parent' ? formData.studentName : formData.name}</strong>, thanks!
                                    </div>

                                    <div className="pt-2 text-xs md:text-sm">
                                        <div className="flex justify-between items-baseline underline decoration-2 decoration-sky-200">
                                            <span className="truncate mr-2">{selectedBundle.name}</span>
                                            <span className="flex-shrink-0">${selectedBundle.price}</span>
                                        </div>
                                        {extraSelections.map(e => (
                                            <div key={e.id} className="flex justify-between items-baseline text-[#64748b] text-[10px] md:text-xs">
                                                <span className="pl-2 md:pl-4 truncate mr-2">+ {e.label}</span>
                                                <span className="flex-shrink-0">$3</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center text-lg md:text-xl font-bold text-[#1e293b] pt-3 md:pt-4 border-t-2 border-[#1e293b] mt-3 md:mt-4" style={{ lineHeight: '1.2' }}>
                                        <span>TOTAL</span>
                                        <div className="bg-[#fef3c7] px-2 py-1 transform rotate-[-2deg] shadow-sm border border-[#f59e0b]">${currentTotal}</div>
                                    </div>

                                    <div className="text-center pt-4 md:pt-8 text-[#64748b] text-[10px] md:text-xs leading-tight">
                                        <p>Payment: {paymentMethod === 'paynow' ? 'PayNow' : 'Cash'}</p>
                                        <p className="mt-2 hidden md:block">"An idea that is not dangerous is unworthy of being called an idea at all."</p>
                                        <p className="text-[9px] mt-1 hidden md:block">— Oscar Wilde</p>
                                        <div className="mt-2 text-[9px] md:text-[10px] uppercase tracking-widest">--- End of Receipt ---</div>
                                    </div>
                                </div>

                                {/* Doodle / Sticker - Smaller on mobile */}
                                <div className="absolute bottom-4 right-4 md:bottom-10 md:right-8 transform rotate-[-10deg] opacity-80 pointer-events-none">
                                    <div className="border-3 md:border-4 border-[#22c55e] rounded-full p-1 md:p-2 w-14 h-14 md:w-20 md:h-20 flex items-center justify-center text-[#22c55e] font-black text-[8px] md:text-xs uppercase text-center bg-white/50 backdrop-blur-sm">
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
    };

    return (
        <div className="min-h-screen bg-[#2d3f44] text-white font-sans overflow-x-hidden selection:bg-[#4ADE80] selection:text-[#0a0a0a]">
            {/* Background gradient - inline instead of external URL for faster loading */}
            <div className="fixed inset-0 pointer-events-none opacity-10 bg-gradient-to-br from-[#36484d]/5 via-transparent to-[#764134]/5 z-0"></div>

            {/* Header - Glassy with enhanced blur */}
            <header className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-white/5 backdrop-blur-3xl border-b border-white/10 shadow-xl shadow-black/20 z-50 px-3 md:px-6 flex items-center justify-between" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
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
                {step === 6 && renderStep6_Processing()}
                {step === 5 && renderStep5_Receipt()}
                {step === 15 && renderStep15_Verification()}
            </div>
        </div>
    );
}
