import { AppLanguage } from '../types/api';

export type TranslationKey =
  | 'marketTitle'
  | 'marketSubtitle'
  | 'searchPlaceholder'
  | 'aiPick'
  | 'viewNow'
  | 'topFertilizers'
  | 'essentialSeeds'
  | 'modernTools'
  | 'cropCare'
  | 'noProductsFound'
  | 'tryDifferentFilters'
  | 'cart'
  | 'cartEmptyTitle'
  | 'cartEmptySubtitle'
  | 'startShopping'
  | 'checkout'
  | 'continueShopping'
  | 'subtotal'
  | 'tax'
  | 'shipping'
  | 'discount'
  | 'total'
  | 'deliveryDetails'
  | 'personalInfo'
  | 'name'
  | 'phone'
  | 'email'
  | 'address'
  | 'city'
  | 'state'
  | 'pincode'
  | 'orderSummary'
  | 'placeOrder'
  | 'processing'
  | 'orderFailed'
  | 'fillRequiredFields'
  | 'orderSuccess'
  | 'orderSuccessSubtitle'
  | 'orderId'
  | 'deliveryInfo'
  | 'deliveryInfoSubtitle'
  | 'viewOrderHistory'
  | 'noOrders'
  | 'noOrdersSubtitle'
  | 'orderHistory'
  | 'order'
  | 'statusPending'
  | 'statusConfirmed'
  | 'statusShipped'
  | 'statusDelivered'
  | 'moreItems'
  | 'viewDetails'
  | 'productDetails'
  | 'back'
  | 'share'
  | 'certified'
  | 'reviews'
  | 'unitsInStock'
  | 'whatItDoes'
  | 'whyUse'
  | 'keyBenefits'
  | 'farmerFriendlyFormula'
  | 'safeUsage'
  | 'cropSupport'
  | 'resultIn'
  | 'safety'
  | 'useCases'
  | 'howToUse'
  | 'followLabel'
  | 'bestFor'
  | 'applyRecommended'
  | 'expectedDelivery'
  | 'repeatUsage'
  | 'farmerReviews'
  | 'rating'
  | 'addToCart'
  | 'buyNow'
  | 'added'
  | 'productAddedToCart'
  | 'loginRequired'
  | 'verifyOtpFirst'
  | 'orderCreated'
  | 'orderCreatedSuccess'
  | 'orderFailedAuth'
  | 'loginTitle'
  | 'loginSubtitle'
  | 'welcomeBack'
  | 'mobileNumber'
  | 'invalidPhone'
  | 'getOtp'
  | 'sending'
  | 'sendOtpFailed'
  | 'goodMorning'
  | 'todaysInsight'
  | 'viewAll'
  | 'aiCropAssistant'
  | 'cropInsight'
  | 'tapToSpeak'
  | 'voiceFarmingHelp'
  | 'startListening'
  | 'yourLanguageYourApp'
  | 'youCanChangeLanguageAnytime'
  | 'getStarted'
  | 'profile'
  | 'profileSettings'
  | 'crops'
  | 'landSize'
  | 'landUnit'
  | 'location'
  | 'edit'
  | 'save'
  | 'signOut'
  | 'language'
  | 'farmDetails'
  | 'nameCannotBeEmpty'
  | 'selectLocation'
  | 'selectDistrict'
  | 'failedToUpdateProfile'
  | 'wheat'
  | 'rice'
  | 'cotton'
  | 'mustard'
  | 'acre'
  | 'hectare'
  | 'chatTitle'
  | 'greeting'
  | 'enableMicrophone'
  | 'microphoneNotAvailable'
  | 'selectImage'
  | 'takePhoto'
  | 'chooseFromGallery'
  | 'sendMessage'
  | 'recordVoice'
  | 'sessionExpired'
  | 'pleaseLoginAgain'
  | 'backendsConnectionError'
  | 'aiAssistant'
  | 'online'
  | 'today'
  | 'imageAttached'
  | 'noAudio'
  | 'noAudioPayload'
  | 'typeHere'
  | 'audioPlayback'
  | 'otpVerification'
  | 'enterTheCode'
  | 'verifySentence'
  | 'sentCodeTo'
  | 'tooManyAttempts'
  | 'enterAllSixDigits'
  | 'invalidOrExpiredOtp'
  | 'failedToResendOtp'
  | 'verifying'
  | 'verify'
  | 'resend'
  | 'devModeOnly'
  | 'resendOtpIn'
  | 'sendingResend'
  | 'didntReceiveCode'
  | 'secureConnection'
  | 'stepTwoOfThree'
  | 'thinking'
  | 'listening'
  | 'ready'
  | 'askYourCropQuestionIn'
  | 'voiceResponse'
  | 'stopAndSend'
  | 'startRecording'
  | 'playbackFailed'
  | 'voicePlaybackFailed'
  | 'voiceRequestFailed'
  | 'voiceRouteUnavailable';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  English: {
    marketTitle: 'Market',
    marketSubtitle: 'Premium Agri Market',
    searchPlaceholder: 'Search fertilizers, seeds, tools...',
    aiPick: 'AI Pick',
    viewNow: 'View Now',
    topFertilizers: 'Top Fertilizers',
    essentialSeeds: 'Essential Seeds',
    modernTools: 'Modern Tools',
    cropCare: 'Crop Care',
    noProductsFound: 'No products found',
    tryDifferentFilters: 'Try different filters or search terms.',
    cart: 'Cart',
    cartEmptyTitle: 'Your cart is empty',
    cartEmptySubtitle: 'Add products to start shopping.',
    startShopping: 'Start Shopping',
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    tax: 'Tax',
    shipping: 'Shipping',
    discount: 'Discount',
    total: 'Total',
    deliveryDetails: 'Delivery Details',
    personalInfo: 'Personal Information',
    name: 'Name',
    phone: 'Phone Number',
    email: 'Email',
    address: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    processing: 'Processing...',
    orderFailed: 'Order Failed',
    fillRequiredFields: 'Please fill all required fields',
    orderSuccess: 'Order Successful!',
    orderSuccessSubtitle: 'Your order has been placed successfully.',
    orderId: 'Order ID',
    deliveryInfo: 'Delivery Information',
    deliveryInfoSubtitle: 'Tracking details will be shared on your email.',
    viewOrderHistory: 'View Order History',
    noOrders: 'No orders yet',
    noOrdersSubtitle: 'You have not placed any orders yet.',
    orderHistory: 'Order History',
    order: 'Order',
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusShipped: 'Shipped',
    statusDelivered: 'Delivered',
    moreItems: 'more items',
    viewDetails: 'View Details',
    productDetails: 'Product Details',
    back: 'Back',
    share: 'Share',
    certified: 'Certified',
    reviews: 'reviews',
    unitsInStock: 'Units in stock',
    whatItDoes: 'What it does',
    whyUse: 'Why use',
    keyBenefits: 'Key Benefits',
    farmerFriendlyFormula: 'Farmer friendly formula',
    safeUsage: 'Safe usage with instructions',
    cropSupport: 'Crops supported across conditions',
    resultIn: 'Result in',
    safety: 'Safety',
    useCases: 'Use cases',
    howToUse: 'How to use',
    followLabel: 'Follow label instructions for dosage.',
    bestFor: 'Best for',
    applyRecommended: 'Apply during recommended crop stage.',
    expectedDelivery: 'Expected delivery',
    repeatUsage: 'Repeat based on crop requirement.',
    farmerReviews: 'Farmer Reviews',
    rating: 'Rating',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    added: 'Added',
    productAddedToCart: 'Product added to cart',
    loginRequired: 'Login required',
    verifyOtpFirst: 'Please verify OTP before creating orders.',
    orderCreated: 'Order created',
    orderCreatedSuccess: 'The backend accepted the order request.',
    orderFailedAuth: 'Orders require an authenticated backend session.',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Enter your mobile number to get started',
    welcomeBack: 'Welcome back',
    mobileNumber: 'Mobile Number',
    invalidPhone: 'Enter a valid 10-15 digit phone number',
    getOtp: 'Get OTP',
    sending: 'Sending...',
    sendOtpFailed: 'Failed to send OTP. Please try again.',
    goodMorning: 'Good morning',
    todaysInsight: "Today's Insight",
    viewAll: 'View All',
    aiCropAssistant: 'AI Crop Assistant',
    cropInsight: 'Your wheat field is holding moisture well. Consider a light nutrient application before evening irrigation.',
    tapToSpeak: 'Tap to Speak',
    voiceFarmingHelp: 'Voice-first farming help',
    startListening: 'Start Listening',
    yourLanguageYourApp: 'Your Language, Your App',
    youCanChangeLanguageAnytime: 'You can change language anytime in settings',
    getStarted: 'Get Started',
    profile: 'Profile',
    profileSettings: 'Profile Settings',
    crops: 'Crops',
    landSize: 'Land Size',
    landUnit: 'Land Unit',
    location: 'Location',
    edit: 'Edit',
    save: 'Save',
    signOut: 'Sign Out',
    language: 'Language',
    farmDetails: 'Farm Details',
    nameCannotBeEmpty: 'Name cannot be empty',
    selectLocation: 'Select Location',
    selectDistrict: 'Select District',
    failedToUpdateProfile: 'Failed to update profile',
    wheat: 'Wheat',
    rice: 'Rice',
    cotton: 'Cotton',
    mustard: 'Mustard',
    acre: 'Acre',
    hectare: 'Hectare',
    chatTitle: 'Chat',
    greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
    enableMicrophone: 'Enable microphone access',
    microphoneNotAvailable: 'Microphone not available',
    selectImage: 'Select Image',
    takePhoto: 'Take Photo',
    chooseFromGallery: 'Choose from Gallery',
    sendMessage: 'Send',
    recordVoice: 'Record Voice',
    sessionExpired: 'Session expired. Please login again.',
    pleaseLoginAgain: 'Please login again.',
    backendsConnectionError: 'Unable to reach backend. Check backend server and mobile API network.',
    aiAssistant: 'AI Sahayak',
    online: 'Online',
    today: 'Today',
    imageAttached: 'Image attached',
    noAudio: 'No audio',
    noAudioPayload: 'This response has no audio payload.',
    typeHere: 'Type in Hindi, English...',
    audioPlayback: 'Audio playback',
    otpVerification: 'OTP Verification',
    enterTheCode: 'Enter the code',
    verifySentence: 'Verify',
    sentCodeTo: "We've sent code to",
    tooManyAttempts: 'Too many failed attempts. Please resend OTP.',
    enterAllSixDigits: 'Enter all 6 digits',
    invalidOrExpiredOtp: 'Invalid or expired OTP',
    failedToResendOtp: 'Failed to resend OTP',
    verifying: 'Verifying...',
    verify: 'Verify',
    resend: 'Resend',
    devModeOnly: 'Dev Mode Only:',
    resendOtpIn: 'Resend OTP in',
    sendingResend: 'Sending...',
    didntReceiveCode: "Didn't receive the code? Resend",
    secureConnection: 'Secure, encrypted connection',
    stepTwoOfThree: 'Step 2 of 3',
    thinking: 'Thinking...',
    listening: 'Listening...',
    ready: 'Tap to speak',
    askYourCropQuestionIn: 'Ask your crop question in',
    voiceResponse: 'AI Response',
    stopAndSend: 'Stop & Send',
    startRecording: 'Start Recording',
    playbackFailed: 'Playback Failed',
    voicePlaybackFailed: 'Could not play the voice response.',
    voiceRequestFailed: 'Voice Request Failed',
    voiceRouteUnavailable: 'Voice service is currently unavailable. Please try again later.',
  },
  Hindi: {
    marketTitle: 'मार्केट',
    marketSubtitle: 'प्रीमियम कृषि बाजार',
    searchPlaceholder: 'खाद, बीज, उपकरण खोजें...',
    aiPick: 'AI सुझाव',
    viewNow: 'अभी देखें',
    topFertilizers: 'टॉप खाद',
    essentialSeeds: 'जरूरी बीज',
    modernTools: 'आधुनिक उपकरण',
    cropCare: 'फसल देखभाल',
    noProductsFound: 'कोई उत्पाद नहीं मिला',
    tryDifferentFilters: 'अलग फिल्टर या खोज शब्द आज़माएं।',
    cart: 'कार्ट',
    cartEmptyTitle: 'आपका कार्ट खाली है',
    cartEmptySubtitle: 'खरीदारी शुरू करने के लिए उत्पाद जोड़ें।',
    startShopping: 'खरीदारी शुरू करें',
    checkout: 'चेकआउट पर जाएं',
    continueShopping: 'खरीदारी जारी रखें',
    subtotal: 'उप-योग',
    tax: 'कर',
    shipping: 'शिपिंग',
    discount: 'छूट',
    total: 'कुल',
    deliveryDetails: 'डिलीवरी विवरण',
    personalInfo: 'व्यक्तिगत जानकारी',
    name: 'नाम',
    phone: 'फोन नंबर',
    email: 'ईमेल',
    address: 'पता',
    city: 'शहर',
    state: 'राज्य',
    pincode: 'पिनकोड',
    orderSummary: 'ऑर्डर सारांश',
    placeOrder: 'ऑर्डर करें',
    processing: 'प्रोसेस हो रहा है...',
    orderFailed: 'ऑर्डर विफल',
    fillRequiredFields: 'कृपया सभी आवश्यक फील्ड भरें',
    orderSuccess: 'ऑर्डर सफल!',
    orderSuccessSubtitle: 'आपका ऑर्डर सफलतापूर्वक हो गया है।',
    orderId: 'ऑर्डर ID',
    deliveryInfo: 'डिलीवरी जानकारी',
    deliveryInfoSubtitle: 'ट्रैकिंग विवरण ईमेल पर भेजा जाएगा।',
    viewOrderHistory: 'ऑर्डर हिस्ट्री देखें',
    noOrders: 'अभी तक कोई ऑर्डर नहीं',
    noOrdersSubtitle: 'आपने अभी तक कोई ऑर्डर नहीं किया।',
    orderHistory: 'ऑर्डर हिस्ट्री',
    order: 'ऑर्डर',
    statusPending: 'लंबित',
    statusConfirmed: 'पुष्ट',
    statusShipped: 'भेजा गया',
    statusDelivered: 'डिलीवर',
    moreItems: 'और आइटम',
    viewDetails: 'विवरण देखें',
    productDetails: 'उत्पाद विवरण',
    back: 'वापस',
    share: 'शेयर',
    certified: 'प्रमाणित',
    reviews: 'समीक्षाएं',
    unitsInStock: 'स्टॉक यूनिट',
    whatItDoes: 'यह क्या करता है',
    whyUse: 'क्यों उपयोग करें',
    keyBenefits: 'मुख्य लाभ',
    farmerFriendlyFormula: 'किसान अनुकूल फॉर्मूला',
    safeUsage: 'निर्देशों के साथ सुरक्षित उपयोग',
    cropSupport: 'अलग स्थितियों में उपयोगी',
    resultIn: 'परिणाम',
    safety: 'सुरक्षा',
    useCases: 'उपयोग मामले',
    howToUse: 'कैसे उपयोग करें',
    followLabel: 'डोज़ के लिए लेबल निर्देश का पालन करें।',
    bestFor: 'सबसे उपयुक्त',
    applyRecommended: 'अनुशंसित चरण में लगाएं।',
    expectedDelivery: 'अनुमानित डिलीवरी',
    repeatUsage: 'आवश्यकता अनुसार दोहराएं।',
    farmerReviews: 'किसान समीक्षा',
    rating: 'रेटिंग',
    addToCart: 'कार्ट में जोड़ें',
    buyNow: 'अभी खरीदें',
    added: 'जोड़ दिया गया',
    productAddedToCart: 'उत्पाद कार्ट में जोड़ दिया गया',
    loginRequired: 'लॉगिन आवश्यक',
    verifyOtpFirst: 'ऑर्डर से पहले OTP सत्यापित करें।',
    orderCreated: 'ऑर्डर बना',
    orderCreatedSuccess: 'बैकएंड ने ऑर्डर स्वीकार कर लिया।',
    orderFailedAuth: 'ऑर्डर के लिए प्रमाणित सत्र आवश्यक है।',
    loginTitle: 'स्वागत है',
    loginSubtitle: 'शुरू करने के लिए अपना मोबाइल नंबर दर्ज करें',
    welcomeBack: 'स्वागत है',
    mobileNumber: 'मोबाइल नंबर',
    invalidPhone: 'एक मान्य 10-15 अंकीय फोन नंबर दर्ज करें',
    getOtp: 'OTP प्राप्त करें',
    sending: 'भेज रहे हैं...',
    sendOtpFailed: 'OTP भेजने में विफल। कृपया दोबारा प्रयास करें।',
    goodMorning: 'सुप्रभात',
    todaysInsight: 'आज की जानकारी',
    viewAll: 'सभी देखें',
    aiCropAssistant: 'AI फसल सहायक',
    cropInsight: 'आपका गेहूं का खेत नमी को अच्छी तरह रख रहा है। शाम की सिंचाई से पहले हल्के पोषक तत्व का आवेदन करने पर विचार करें।',
    tapToSpeak: 'बोलने के लिए टैप करें',
    voiceFarmingHelp: 'वॉयस-पहली खेती की सहायता',
    startListening: 'सुनना शुरू करें',
    yourLanguageYourApp: 'आपकी भाषा, आपका ऐप',
    youCanChangeLanguageAnytime: 'आप किसी भी समय सेटिंग्स में भाषा बदल सकते हैं',
    getStarted: 'शुरू करें',
    profile: 'प्रोफाइल',
    profileSettings: 'प्रोफाइल सेटिंग्स',
    crops: 'फसलें',
    landSize: 'भूमि का आकार',
    landUnit: 'भूमि की इकाई',
    location: 'स्थान',
    edit: 'संपादित करें',
    save: 'सहेजें',
    signOut: 'साइन आउट',
    language: 'भाषा',
    farmDetails: 'खेत की विस्तृत जानकारी',
    nameCannotBeEmpty: 'नाम खाली नहीं हो सकता',
    selectLocation: 'स्थान चुनें',
    selectDistrict: 'जिला चुनें',
    failedToUpdateProfile: 'प्रोफाइल अपडेट करने में विफल',
    wheat: 'गेहूं',
    rice: 'चावल',
    cotton: 'कपास',
    mustard: 'सरसों',
    acre: 'एकड़',
    hectare: 'हेक्टेयर',
    chatTitle: 'चैट',
    greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
    enableMicrophone: 'माइक्रोफोन एक्सेस सक्षम करें',
    microphoneNotAvailable: 'माइक्रोफोन उपलब्ध नहीं है',
    selectImage: 'छवि चुनें',
    takePhoto: 'फोटो लें',
    chooseFromGallery: 'गैलरी से चुनें',
    sendMessage: 'भेजें',
    recordVoice: 'वॉयस रिकॉर्ड करें',
    sessionExpired: 'सत्र समाप्त हो गया। कृपया दोबारा लॉगिन करें।',
    pleaseLoginAgain: 'कृपया दोबारा लॉगिन करें।',
    backendsConnectionError: 'बैकएंड तक नहीं पहुंच सकते। बैकएंड सर्वर और मोबाइल API नेटवर्क की जांच करें।',
    aiAssistant: 'AI सहायक',
    online: 'ऑनलाइन',
    today: 'आज',
    imageAttached: 'छवि जोड़ी गई',
    noAudio: 'कोई ऑडियो नहीं',
    noAudioPayload: 'इस प्रतिक्रिया में कोई ऑडियो नहीं है।',
    typeHere: 'हिंदी, अंग्रेजी में टाइप करें...',
    audioPlayback: 'ऑडियो प्लेबैक',
    otpVerification: 'OTP सत्यापन',
    enterTheCode: 'कोड दर्ज करें',
    verifySentence: 'सत्यापित करें',
    sentCodeTo: 'हमने कोड भेजा है',
    tooManyAttempts: 'बहुत सारे असफल प्रयास। कृपया OTP फिर से भेजें।',
    enterAllSixDigits: 'सभी 6 अंक दर्ज करें',
    invalidOrExpiredOtp: 'अमान्य या समाप्त OTP',
    failedToResendOtp: 'OTP फिर से भेजने में विफल',
    verifying: 'सत्यापन जारी है...',
    verify: 'सत्यापित करें',
    resend: 'फिर से भेजें',
    devModeOnly: 'केवल डेव मोड:',
    resendOtpIn: 'OTP फिर से भेजें',
    sendingResend: 'भेज रहे हैं...',
    didntReceiveCode: 'कोड नहीं मिला? फिर से भेजें',
    secureConnection: 'सुरक्षित एन्क्रिप्टेड कनेक्शन',
    stepTwoOfThree: 'चरण 2 (3 में से)',
    thinking: 'सोच रहे हैं...',
    listening: 'सुन रहे हैं...',
    ready: 'बोलने के लिए टैप करें',
    askYourCropQuestionIn: 'अपना फसल प्रश्न पूछें',
    voiceResponse: 'AI जवाब',
    stopAndSend: 'रोकें और भेजें',
    startRecording: 'रिकॉर्डिंग शुरू करें',
    playbackFailed: 'प्लेबैक विफल',
    voicePlaybackFailed: 'वॉयस रिस्पॉन्स नहीं चला सका।',
    voiceRequestFailed: 'वॉयस अनुरोध विफल',
    voiceRouteUnavailable: 'वॉयस सेवा वर्तमान में उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।',
  },
  Gujarati: {
    marketTitle: 'ખેતી બજાર',
    marketSubtitle: 'પ્રીમિયમ કૃષિ બજાર',
    searchPlaceholder: 'ખાતર, બીજ, સાધનો શોધો...',
    aiPick: 'AI પસંદગી',
    viewNow: 'હમણાં જુઓ',
    topFertilizers: 'ટોચના ખાતર',
    essentialSeeds: 'જરૂરી બીજ',
    modernTools: 'આધુનિક સાધનો',
    cropCare: 'ફસલ સંભાળ',
    noProductsFound: 'ઉત્પાદન મળ્યું નહીં',
    tryDifferentFilters: 'અલગ ફિલ્ટર અથવા સર્ચ શબ્દ અજમાવો.',
    cart: 'કાર્ટ',
    cartEmptyTitle: 'તમારું કાર્ટ ખાલી છે',
    cartEmptySubtitle: 'ખરીદી શરૂ કરવા માટે ઉત્પાદ ઉમેરો.',
    startShopping: 'ખરીદી શરૂ કરો',
    checkout: 'ચેકઆઉટ તરફ આગળ વધો',
    continueShopping: 'વધુ શોપિંગ કરો',
    subtotal: 'સબટોટલ',
    tax: 'કર',
    shipping: 'શિપિંગ',
    discount: 'છૂટ',
    total: 'કુલ',
    deliveryDetails: 'ડિલીવરી વિગતો',
    personalInfo: 'વ્યક્તિગત માહિતી',
    name: 'નામ',
    phone: 'ફોન નંબર',
    email: 'ઈમેલ',
    address: 'સરનામું',
    city: 'શહેર',
    state: 'રાજ્ય',
    pincode: 'પિનકોડ',
    orderSummary: 'ઓર્ડર સમરી',
    placeOrder: 'ઓર્ડર કરો',
    processing: 'પ્રોસેસિંગ...',
    orderFailed: 'ઓર્ડર નિષ્ફળ',
    fillRequiredFields: 'કૃપા કરીને જરૂરી વિગતો ભરો',
    orderSuccess: 'ઓર્ડર સફળ!',
    orderSuccessSubtitle: 'તમારો ઓર્ડર સફળતાપૂર્વક પ્લેસ થયો છે.',
    orderId: 'ઓર્ડર ID',
    deliveryInfo: 'ડિલીવરી માહિતી',
    deliveryInfoSubtitle: 'ટ્રેકિંગ વિગતો ઈમેલ પર મળશે.',
    viewOrderHistory: 'ઓર્ડર હિસ્ટરી જુઓ',
    noOrders: 'હજી સુધી કોઈ ઓર્ડર નથી',
    noOrdersSubtitle: 'તમે હજુ સુધી ઓર્ડર કર્યો નથી.',
    orderHistory: 'ઓર્ડર હિસ્ટરી',
    order: 'ઓર્ડર',
    statusPending: 'લાંબિત',
    statusConfirmed: 'પુષ્ટિ પામ્યું',
    statusShipped: 'ડિસપેચ કર્યું',
    statusDelivered: 'ડિલીવર્ડ',
    moreItems: 'વધુ આઇટમ',
    viewDetails: 'વિગતો જુઓ',
    productDetails: 'ઉત્પાદન વિગતો',
    back: 'પાછા',
    share: 'શેર',
    certified: 'પ્રમાણિત',
    reviews: 'રિવ્યૂ',
    unitsInStock: 'સ્ટોક યુનિટ',
    whatItDoes: 'આ શું કરે છે',
    whyUse: 'શા માટે વાપરવું',
    keyBenefits: 'મુખ્ય લાભો',
    farmerFriendlyFormula: 'ખેડૂત મૈત્રીપૂર્ણ ફોર્મ્યુલા',
    safeUsage: 'સૂચના સાથે સલામત ઉપયોગ',
    cropSupport: 'વિવિધ પરિસ્થિતિમાં ઉપયોગી',
    resultIn: 'પરિણામ',
    safety: 'સુરક્ષા',
    useCases: 'ઉપયોગ કિસ્સા',
    howToUse: 'કેવી રીતે વાપરવું',
    followLabel: 'માત્રા માટે લેબલ સૂચનાઓ અનુસરો.',
    bestFor: 'સૌથી સારું',
    applyRecommended: 'ભલામણ કરેલ તબક્કે લાગુ કરો.',
    expectedDelivery: 'અપેક્ષિત ડિલીવરી',
    repeatUsage: 'જરૂર મુજબ પુનરાવર્તન કરો.',
    farmerReviews: 'ખેડૂત સમીક્ષા',
    rating: 'રેટિંગ',
    addToCart: 'કાર્ટમાં ઉમેરો',
    buyNow: 'હમણાં ખરીદો',
    added: 'ઉમેરાયું',
    productAddedToCart: 'ઉત્પાદન કાર્ટમાં ઉમેરાયું',
    loginRequired: 'લોગિન જરૂરી',
    verifyOtpFirst: 'ઓર્ડર પહેલાં OTP ચકાસો.',
    orderCreated: 'ઓર્ડર બનાવ્યો',
    orderCreatedSuccess: 'બેકએન્ડએ ઓર્ડર સ્વીકાર્યો.',
    orderFailedAuth: 'ઓર્ડર માટે પ્રમાણિત સત્ર જરૂરી છે.',
    loginTitle: 'સ્વાગતું',
    loginSubtitle: 'શરૂ કરવા માટે તમારો મોબાઇલ નંબર દાખલ કરો',
    welcomeBack: 'સ્વાગતું',
    mobileNumber: 'મોબાઇલ નંબર',
    invalidPhone: 'એક માન્ય 10-15 અંક ફોન નંબર દાખલ કરો',
    getOtp: 'OTP મેળવો',
    sending: 'મોકલી રહ્યા છીએ...',
    sendOtpFailed: 'OTP મોકલવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.',
    goodMorning: 'શુભ પ્રભાત',
    todaysInsight: 'આજનો તુટકો',
    viewAll: 'બધું જુઓ',
    aiCropAssistant: 'AI ફસલ સહાયક',
    cropInsight: 'તમારુ ગણું ખેતર ભેજ સારી રીતે ધરી રહ્યું છે. સાંજે સિંચાયેટ પહેલાં હળવા પોષક તત્વોનો ઉપયોગ કરવાનું વિચારો.',
    tapToSpeak: 'બોલવા માટે ટેપ કરો',
    voiceFarmingHelp: 'વૉઇસ-પ્રથમ ખેતી મદદ',
    startListening: 'સાંભળવાનું શરૂ કરો',
    yourLanguageYourApp: 'તમારી ભાષા, તમારી ઍપ્લિકેશન',
    youCanChangeLanguageAnytime: 'તમે કોઈ પણ સમયે સેટિંગ્સમાં ભાષા બદલી શકો છો',
    getStarted: 'શરૂ કરો',
    profile: 'પ્રોફાઇલ',
    profileSettings: 'પ્રોફાઇલ સેટિંગ્સ',
    crops: 'ફસલો',
    landSize: 'જમીનનું કદ',
    landUnit: 'જમીનનો એકમ',
    location: 'સ્થાન',
    edit: 'સંપાદિત',
    save: 'સંગ્રહ',
    signOut: 'સાઇન આઉટ',
    language: 'ભાષા',
    farmDetails: 'ખેતર વિગતો',
    nameCannotBeEmpty: 'નામ ખાલી હોઈ શકતું નથી',
    selectLocation: 'સ્થાન પસંદ કરો',
    selectDistrict: 'જિલ્લો પસંદ કરો',
    failedToUpdateProfile: 'પ્રોફાઇલ અપડેટ કરવામાં નિષ્ફળ',
    wheat: 'ગણું',
    rice: 'ચોખું',
    cotton: 'કપાસ',
    mustard: 'સરસો',
    acre: 'એકર',
    hectare: 'હેક્ટર',
    chatTitle: 'ચેટ',
    greeting: 'સાલામતો! હું તમને કેવી રીતે મદદ કરી શકું?',
    enableMicrophone: 'માઇક્રોફોन ઍક્સેસ સક્ષમ કરો',
    microphoneNotAvailable: 'માઇક્રોફોન ઉપલબ્ધ છે નહીં',
    selectImage: 'તસવીર પસંદ કરો',
    takePhoto: 'ફોટો લો',
    chooseFromGallery: 'ગેલેરીમાંથી પસંદ કરો',
    sendMessage: 'મોકલો',
    recordVoice: 'અવાજ રેકોર્ડ કરો',
    sessionExpired: 'સત્ર સમાપ્ત થયો. કૃપા કરીને ફરી લૉગ ઇન કરો.',
    pleaseLoginAgain: 'કૃપા કરીને ફરી લૉગ ઇન કરો.',
    backendsConnectionError: 'બેકએન્ડ સુધી પહોંચાઈ શકાતું નથી. બેકએન્ડ સર્વર અને મોબાઇલ API નેટવર્ક તપાસો.',
    aiAssistant: 'AI સહાયક',
    online: 'ઓનલાઇન',
    today: 'આજ',
    imageAttached: 'છબી જોડાઇ',
    noAudio: 'કોઇ અવાજ નથી',
    noAudioPayload: 'આ જવાબમાં કોઇ અવાજ નથી.',
    typeHere: 'ગુજરાતી, અંગ્રેજીમાં ટાઇપ કરો...',
    audioPlayback: 'અવાજ પ્લેબેક',
    otpVerification: 'OTP ચકાસણી',
    enterTheCode: 'કોડ દાખલ કરો',
    verifySentence: 'ચકાસો',
    sentCodeTo: 'આমે કોડ મોકલ્યો છે',
    tooManyAttempts: 'ખૂબ જ નિષ્ફળ પ્રયાસો. કૃપા કરીને OTP ફરી મોકલો.',
    enterAllSixDigits: 'બધા 6 અંક દાખલ કરો',
    invalidOrExpiredOtp: 'અમાન્ય અથવા સમાપ્ત OTP',
    failedToResendOtp: 'OTP ફરી મોકલવામાં નિષ્ફળ',
    verifying: 'ચકાસણી જારી છે...',
    verify: 'ચકાસો',
    resend: 'ફરી મોકલો',
    devModeOnly: 'ફક્ત ડેવ મોડ:',
    resendOtpIn: 'OTP ફરી મોકલો',
    sendingResend: 'મોકલી રહ્યા છીએ...',
    didntReceiveCode: 'કોડ ન મળ્યો? ફરી મોકલો',
    secureConnection: 'સુરક્ષિત, એન્ક્રિપ્ટેડ જોડાણ',
    stepTwoOfThree: 'પગલું 2 (3 માંથી)',
    thinking: 'વિચારી રહ્યા છીએ...',
    listening: 'સાંભળી રહ્યા છીએ...',
    ready: 'બોલવા માટે ટેપ કરો',
    askYourCropQuestionIn: 'તમારો ફસલ પ્રશ્ન પૂછો',
    voiceResponse: 'AI જવાબ',
    stopAndSend: 'રોકો અને મોકલો',
    startRecording: 'રેકોર્ડિંગ શરૂ કરો',
    playbackFailed: 'પ્લેબેક નિષ્ફળ',
    voicePlaybackFailed: 'વૉઇસ રિસ્પોન્સ ચલાવી શકાયું નથી.',
    voiceRequestFailed: 'વૉઇસ અનુરોધ નિષ્ફળ',
    voiceRouteUnavailable: 'વૉઇસ સેવા હાલમાં ઉપલબ્ધ નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો.',
  },
  Punjabi: {
    marketTitle: 'ਮਾਰਕੀਟ',
    marketSubtitle: 'ਪ੍ਰੀਮੀਅਮ ਖੇਤੀ ਬਾਜ਼ਾਰ',
    searchPlaceholder: 'ਖਾਦ, ਬੀਜ, ਸਾਧਨ ਖੋਜੋ...',
    aiPick: 'AI ਚੋਣ',
    viewNow: 'ਹੁਣ ਵੇਖੋ',
    topFertilizers: 'ਸ੍ਰੇਸ਼ਠ ਖਾਦ',
    essentialSeeds: 'ਲੋੜੀਂਦੇ ਬੀਜ',
    modernTools: 'ਆਧੁਨਿਕ ਸਾਧਨ',
    cropCare: 'ਫਸਲ ਸੰਭਾਲ',
    noProductsFound: 'ਕੋਈ ਪ੍ਰੋਡਕਟ ਨਹੀਂ ਮਿਲਿਆ',
    tryDifferentFilters: 'ਵੱਖਰੇ ਫਿਲਟਰ ਜਾਂ ਖੋਜ ਸ਼ਬਦ ਅਜ਼ਮਾਓ।',
    cart: 'ਕਾਰਟ',
    cartEmptyTitle: 'ਤੁਹਾਡਾ ਕਾਰਟ ਖਾਲੀ ਹੈ',
    cartEmptySubtitle: 'ਖਰੀਦਾਰੀ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਪ੍ਰੋਡਕਟ ਜੋੜੋ।',
    startShopping: 'ਖਰੀਦਾਰੀ ਸ਼ੁਰੂ ਕਰੋ',
    checkout: 'ਚੈਕਆਉਟ ਤੇ ਜਾਓ',
    continueShopping: 'ਖਰੀਦਾਰੀ ਜਾਰੀ ਰੱਖੋ',
    subtotal: 'ਸਬਟੋਟਲ',
    tax: 'ਟੈਕਸ',
    shipping: 'ਸ਼ਿਪਿੰਗ',
    discount: 'ਛੂਟ',
    total: 'ਕੁੱਲ',
    deliveryDetails: 'ਡਿਲਿਵਰੀ ਵੇਰਵੇ',
    personalInfo: 'ਨਿੱਜੀ ਜਾਣਕਾਰੀ',
    name: 'ਨਾਮ',
    phone: 'ਫੋਨ ਨੰਬਰ',
    email: 'ਈਮੇਲ',
    address: 'ਪਤਾ',
    city: 'ਸ਼ਹਿਰ',
    state: 'ਰਾਜ',
    pincode: 'ਪਿਨਕੋਡ',
    orderSummary: 'ਆਰਡਰ ਸੰਖੇਪ',
    placeOrder: 'ਆਰਡਰ ਕਰੋ',
    processing: 'ਪ੍ਰੋਸੈਸ ਹੋ ਰਿਹਾ...',
    orderFailed: 'ਆਰਡਰ ਅਸਫਲ',
    fillRequiredFields: 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਲੋੜੀਂਦੀ ਜਾਣਕਾਰੀ ਭਰੋ',
    orderSuccess: 'ਆਰਡਰ ਸਫਲ!',
    orderSuccessSubtitle: 'ਤੁਹਾਡਾ ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਹੋ ਗਿਆ ਹੈ।',
    orderId: 'ਆਰਡਰ ID',
    deliveryInfo: 'ਡਿਲਿਵਰੀ ਜਾਣਕਾਰੀ',
    deliveryInfoSubtitle: 'ਟ੍ਰੈਕਿੰਗ ਵੇਰਵੇ ਤੁਹਾਡੇ ਈਮੇਲ ਤੇ ਭੇਜੇ ਜਾਣਗੇ।',
    viewOrderHistory: 'ਆਰਡਰ ਹਿਸਟਰੀ ਵੇਖੋ',
    noOrders: 'ਹਾਲੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ',
    noOrdersSubtitle: 'ਤੁਸੀਂ ਹਾਲੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਕੀਤਾ।',
    orderHistory: 'ਆਰਡਰ ਹਿਸਟਰੀ',
    order: 'ਆਰਡਰ',
    statusPending: 'ਬਕਾਇਆ',
    statusConfirmed: 'ਪੁਸ਼ਟੀ',
    statusShipped: 'ਭੇਜਿਆ ਗਿਆ',
    statusDelivered: 'ਡਿਲਿਵਰ',
    moreItems: 'ਹੋਰ ਆਈਟਮ',
    viewDetails: 'ਵੇਰਵਾ ਵੇਖੋ',
    productDetails: 'ਉਤਪਾਦ ਵੇਰਵਾ',
    back: 'ਵਾਪਸ',
    share: 'ਸ਼ੇਅਰ',
    certified: 'ਪ੍ਰਮਾਣਿਤ',
    reviews: 'ਸਮੀਖਿਆਵਾਂ',
    unitsInStock: 'ਸਟਾਕ ਯੂਨਿਟ',
    whatItDoes: 'ਇਹ ਕੀ ਕਰਦਾ ਹੈ',
    whyUse: 'ਕਿਉਂ ਵਰਤਣਾ',
    keyBenefits: 'ਮੁੱਖ ਫਾਇਦੇ',
    farmerFriendlyFormula: 'ਕਿਸਾਨ-ਮਿਤਰ ਫਾਰਮੂਲਾ',
    safeUsage: 'ਹਦਾਇਤਾਂ ਨਾਲ ਸੁਰੱਖਿਅਤ ਵਰਤੋਂ',
    cropSupport: 'ਵੱਖਰੀਆਂ ਸਥਿਤੀਆਂ ਲਈ ਉਚਿਤ',
    resultIn: 'ਨਤੀਜਾ',
    safety: 'ਸੁਰੱਖਿਆ',
    useCases: 'ਵਰਤੋਂ ਕੇਸ',
    howToUse: 'ਕਿਵੇਂ ਵਰਤਣਾ',
    followLabel: 'ਮਾਤਰਾ ਲਈ ਲੇਬਲ ਹਦਾਇਤਾਂ ਮਾਨੋ।',
    bestFor: 'ਸਭ ਤੋਂ ਵਧੀਆ',
    applyRecommended: 'ਸਿਫਾਰਸ਼ੀ ਪੜਾਅ ਤੇ ਲਗਾਓ।',
    expectedDelivery: 'ਅਨੁਮਾਨਿਤ ਡਿਲਿਵਰੀ',
    repeatUsage: 'ਲੋੜ ਅਨੁਸਾਰ ਦੁਹਰਾਓ।',
    farmerReviews: 'ਕਿਸਾਨ ਸਮੀਖਿਆਵਾਂ',
    rating: 'ਰੇਟਿੰਗ',
    addToCart: 'ਕਾਰਟ ਵਿੱਚ ਜੋੜੋ',
    buyNow: 'ਹੁਣ ਖਰੀਦੋ',
    added: 'ਜੋੜਿਆ ਗਿਆ',
    productAddedToCart: 'ਉਤਪਾਦ ਕਾਰਟ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ',
    loginRequired: 'ਲੋਗਇਨ ਲਾਜ਼ਮੀ',
    verifyOtpFirst: 'ਆਰਡਰ ਤੋਂ ਪਹਿਲਾਂ OTP ਤਸਦੀਕ ਕਰੋ।',
    orderCreated: 'ਆਰਡਰ ਬਣਿਆ',
    orderCreatedSuccess: 'ਬੈਕਐਂਡ ਨੇ ਆਰਡਰ ਮੰਨ ਲਿਆ।',
    orderFailedAuth: 'ਆਰਡਰ ਲਈ ਪ੍ਰਮਾਣਿਤ ਸੈਸ਼ਨ ਲੋੜੀਂਦਾ ਹੈ।',
    loginTitle: 'ਸਾਡਾ ਸਵਾਗਤ ਹੈ',
    loginSubtitle: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਆਪਣਾ ਮੋਬਾਈਲ ਨਾਲੀ ਦਰਜ ਕਰੋ',
    welcomeBack: 'ਸਾਡਾ ਸਵਾਗਤ ਹੈ',
    mobileNumber: 'ਮੋਬਾਈਲ ਨਾਲੀ',
    invalidPhone: 'ਇਕ ਵੈਰ 10-15 ਅੰਕਾਂ ਦੀ ਫੋਨ ਨਾਲੀ ਦਰਜ ਕਰੋ',
    getOtp: 'OTP ਲਓ',
    sending: 'ਭੇਜ ਰਹੇ ਆਂ...',
    sendOtpFailed: 'OTP ਭੇਜਣਾ ਅਸਫਲ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    goodMorning: 'ਸ਼ੁਭ ਪ੍ਰਭਾਤ',
    todaysInsight: 'ਅੱਜ ਦੀ ਖਬਰ',
    viewAll: 'ਸਭ ਵੇਖੋ',
    aiCropAssistant: 'AI ਫਸਲ ਸਹਾਇਤਾ',
    cropInsight: 'ਤੁਹਾਡਾ ਕਣਕ ਦਾ ਖੇਤ ਨਮੀ ਨੂੰ ਚੰਗੀ ਤਰ੍ਹਾ ਸੰਭਾਲ ਰਿਹਾ ਹੈ। ਸ਼ਾਮ ਦੀ ਸਿੰਚਾਈ ਤੋਂ ਪਹਿਲਾਂ ਹਲਕੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦਾ ਉਪਯੋਗ ਕਰਨ ਤੇ ਵਿਚਾਰ ਕਰੋ।',
    tapToSpeak: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ',
    voiceFarmingHelp: 'ਵੌਇਸ-ਪਹਿਲੀ ਖੇਤੀ ਸਹਾਇਤਾ',
    startListening: 'ਸੁਣਨਾ ਸ਼ੁਰੂ ਕਰੋ',
    yourLanguageYourApp: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ, ਤੁਹਾਡੀ ਐਪ',
    youCanChangeLanguageAnytime: 'ਤੁਸੀਂ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਕਿਸੇ ਵੀ ਸਮੇਂ ਭਾਸ਼ਾ ਬਦਲ ਸਕਦੇ ਹੋ',
    getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    profileSettings: 'ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਾਂ',
    crops: 'ਫਸਲਾਂ',
    landSize: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ',
    landUnit: 'ਜ਼ਮੀਨ ਦਾ ਯੂਨਿਟ',
    location: 'ਲੋਕੇਸ਼ਨ',
    edit: 'ਸੰਸ਼ੋਧਿਤ ਕਰੋ',
    save: 'ਬਚਤ',
    signOut: 'ਸਾਈਨ ਆਊਟ',
    language: 'ਭਾਸ਼ਾ',
    farmDetails: 'ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ',
    nameCannotBeEmpty: 'ਨਾਮ ਖਾਲੀ ਨਹੀਂ ਹੋ ਸਕਦਾ',
    selectLocation: 'ਲੋਕੇਸ਼ਨ ਚੁਣੋ',
    selectDistrict: 'ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ',
    failedToUpdateProfile: 'ਪ੍ਰੋਫਾਈਲ ਅਪਡੇਟ ਕਰਨਾ ਅਸਫਲ',
    wheat: 'ਕਣਕ',
    rice: 'ਚਾਵਲ',
    cotton: 'ਰੂਈ',
    mustard: 'ਸਾਰਸੋਂ',
    acre: 'ਏਕੜ',
    hectare: 'ਹੈਕਟਰ',
    chatTitle: 'ਚੈਟ',
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    enableMicrophone: 'ਮਾਈਕਰੋਫੋਨ ਐਕਸੈਸ ਸਮਰਥ ਕਰੋ',
    microphoneNotAvailable: 'ਮਾਈਕਰੋਫੋਨ ਉਪਲਬਧ ਨਹੀਂ',
    selectImage: 'ਤਸਵੀਰ ਚੁਣੋ',
    takePhoto: 'ਤਸਵੀਰ ਲਓ',
    chooseFromGallery: 'ਗੇਲਰੀ ਤੋਂ ਚੁਣੋ',
    sendMessage: 'ਭੇਜੋ',
    recordVoice: 'ਆਵਾਜ਼ ਰਿਕਾਰਡ ਕਰੋ',
    sessionExpired: 'ਸੈਸ਼ਨ ਖ਼ਤਮ ਹੋ ਗਿਆ। ਮਿਹਰਬਾਨੀ ਨਾਲ ਦੁਬਾਰਾ ਲਾਗਇਨ ਕਰੋ।',
    pleaseLoginAgain: 'ਮਿਹਰਬਾਨੀ ਨਾਲ ਦੁਬਾਰਾ ਲਾਗਇਨ ਕਰੋ।',
    backendsConnectionError: 'ਬੈਕਐਂਡ ਤੱਕ ਪਹੂੰਚ ਨਹੀਂ ਸਕੇ। ਬੈਕਐਂਡ ਸਰਵਰ ਅਤੇ ਮੋਬਾਈਲ API ਨੈਟਵਰਕ ਦੀ ਜਾਂਚ ਕਰੋ।',
    aiAssistant: 'AI ਸਹਾਇਕ',
    online: 'ਆਨਲਾਈਨ',
    today: 'ਅੱਜ',
    imageAttached: 'ਤਸਵੀਰ ਜੁੜੀ ਹੋਈ',
    noAudio: 'ਕੋਈ ਆਡੀਓ ਨਹੀਂ',
    noAudioPayload: 'ਇਸ ਜਵਾਬ ਲਈ ਕੋਈ ਆਡੀਓ ਨਹੀਂ।',
    typeHere: 'ਪੰਜਾਬੀ, ਅੰਗ੍ਰੇਜ਼ੀ ਵਿੱਚ ਟਾਈਪ ਕਰੋ...',
    audioPlayback: 'ਆਡੀਓ ਪਲੇਬੈਕ',
    otpVerification: 'OTP ਤਸਦੀਕ',
    enterTheCode: 'ਕੋਡ ਦੀ ਪਾਲਣਾ ਕਰੋ',
    verifySentence: 'ਤਸਦੀਕ',
    sentCodeTo: 'ਅਸੀਂ ਕੋਡ ਭੇਜਿਆ ਹੈ',
    tooManyAttempts: 'ਬਹੁਤ ਸਾਰੀਆਂ ਅਸਫਲ ਕੋਸ਼ਿਸ਼ਾਂ। ਮਿਹਰਬਾਨੀ ਨਾਲ OTP ਦੁਬਾਰਾ ਭੇਜੋ।',
    enterAllSixDigits: 'ਸਭ 6 ਅੰਕ ਦੀ ਪਾਲਣਾ ਕਰੋ',
    invalidOrExpiredOtp: 'ਅਮਾਨਤ ਜਾਂ ਲਾਗੂ ਖਤਮ OTP',
    failedToResendOtp: 'OTP ਦੁਬਾਰਾ ਭੇਜਣਾ ਅਸਫਲ',
    verifying: 'ਤਸਦੀਕ ਜਾਰੀ ਹੈ...',
    verify: 'ਤਸਦੀਕ ਕਰੋ',
    resend: 'ਦੁਬਾਰਾ ਭੇਜੋ',
    devModeOnly: 'ਸਿਰਫ Dev ਮੋਡ:',
    resendOtpIn: 'OTP ਦੁਬਾਰਾ ਭੇਜੋ',
    sendingResend: 'ਭੇਜ ਰਹਾ ਹਾਂ...',
    didntReceiveCode: 'ਕੋਡ ਨਹੀਂ ਮਿਲਿਆ? ਦੁਬਾਰਾ ਭੇਜੋ',
    secureConnection: 'ਸੁਰੱਖਿਅਤ, ਐਨਕ੍ਰਿਪਟਡ ਸੰਪਰਕ',
    stepTwoOfThree: 'ਤਬਦਾ 2 (3 ਵਿੱਚੋਂ)',
    thinking: 'ਸੋਚ ਰਿਹਾ ਹੈ...',
    listening: 'ਸੁਣ ਰਿਹਾ ਹੈ...',
    ready: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ',
    askYourCropQuestionIn: 'ਆਪਣਾ ਫਸਲ ਸੰਬੰਧੀ ਸਵਾਲ ਪੁੱਛੋ',
    voiceResponse: 'AI ਜਵਾਬ',
    stopAndSend: 'ਰੋਕੋ ਅਤੇ ਭੇਜੋ',
    startRecording: 'ਰਿਕਾਰਡਿੰਗ ਸ਼ੁਰੂ ਕਰੋ',
    playbackFailed: 'ਪਲੇਬੈਕ ਫੇਲ',
    voicePlaybackFailed: 'ਵੌਇਸ ਜਵਾਬ ਨਹੀਂ ਚਲਾ ਸਕਿਆ।',
    voiceRequestFailed: 'ਵੌਇਸ ਬੇਨਤੀ ਫੇਲ',
    voiceRouteUnavailable: 'ਵੌਇਸ ਸੇਵਾ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
};

export function t(language: AppLanguage, key: TranslationKey): string {
  return translations[language]?.[key] ?? translations.English[key];
}

export function localeForLanguage(language: AppLanguage): string {
  if (language === 'Hindi') return 'hi-IN';
  if (language === 'Gujarati') return 'gu-IN';
  if (language === 'Punjabi') return 'pa-IN';
  return 'en-IN';
}
