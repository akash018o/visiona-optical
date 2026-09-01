import { STORE_CONFIG, CATEGORIES, SERVICES, PRODUCTS, INQUIRY_TYPES } from "/config/store.js";

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const toastRoot = document.querySelector("#toast-root");
let mobileOpen = false;
let adminTab = "overview";
let adminData = null;
let editingProductId = null;
let openingHoursDraft = null;

/* ---------- Language ---------- */
const LANG_KEY = "visiona-lang";
let lang = localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en";

const STRINGS = {
  en: {
    "nav.home": "Home", "nav.eyewear": "Eyewear", "nav.gallery": "Gallery", "nav.services": "Services",
    "nav.eye-test": "Eye Testing", "nav.about": "About", "nav.reviews": "Reviews", "nav.contact": "Contact",
    "bookEyeTest": "Book eye test", "toggleNav": "Toggle navigation",
    "footer.explore": "Explore", "footer.visitContact": "Visit or contact us", "footer.chatWhatsapp": "Chat on WhatsApp",
    "footer.rights": "All rights reserved.", "footer.privacy": "Privacy policy", "footer.terms": "Terms & conditions", "footer.admin": "Admin",
    "mobile.call": "Call", "mobile.whatsapp": "WhatsApp", "mobile.directions": "Directions",
    "home.eyebrowPrefix": "Local eyewear . ", "home.exploreEyewear": "Explore eyewear", "home.bookEyeTest": "Book an eye test",
    "home.visitStore": "Visit our store", "home.callUs": "Call us", "home.whatsapp": "WhatsApp", "home.directions": "Directions",
    "home.everyFaceEyebrow": "For every face, every day", "home.everyFaceHeading": "Eyewear that meets you where you are.",
    "home.everyFaceText": "Start with the people who wear it. Our showroom collection is there to explore in person, never to click and buy online.",
    "home.experienceEyebrow": "A better in-store experience", "home.experienceHeading": "Helpful by design.",
    "home.experienceText": "We keep the experience simple: clear options, warm advice, and enough time to decide.",
    "home.reason1Title": "Professional eye testing", "home.reason1Text": "Request a convenient appointment and let our team confirm the details with you.",
    "home.reason2Title": "Eyewear for all ages", "home.reason2Text": "Explore shapes and comfortable fits for kids, adults, and seniors.",
    "home.reason3Title": "Personal frame guidance", "home.reason3Text": "Take your time and get practical help finding the right feel and look.",
    "home.reason4Title": "Quality lens options", "home.reason4Text": "Ask about lens types for your everyday visual needs.",
    "home.reason5Title": "Local customer support", "home.reason5Text": "Visit, call, or message us whenever you need a hand.",
    "home.testingEyebrow": "Eye testing", "home.testingHeading": "Clear next steps for your vision.",
    "home.testingText": "Send an appointment request online. We will contact you to confirm a suitable time, it is never automatically booked.",
    "home.previewEyebrow": "A small preview", "home.previewHeading": "Frames worth trying on.",
    "home.previewText": "These are showcase frames, not an online catalogue for purchase. Ask us what is currently available in store.",
    "home.viewAllEyewear": "View all eyewear",
    "home.stepsEyebrow": "How it works", "home.stepsHeading": "Four simple steps, in person.",
    "home.step1Title": "Visit the store", "home.step1Text": "Come in, browse, and tell us what you need.",
    "home.step2Title": "Get your eyes tested", "home.step2Text": "Request an appointment if an eye test is right for you.",
    "home.step3Title": "Choose your frame", "home.step3Text": "Try on shapes, materials, and colours at your own pace.",
    "home.step4Title": "Get lens guidance", "home.step4Text": "Talk through options for your day-to-day comfort.",
    "home.reviewsEyebrow": "Customer reviews", "home.reviewsHeading": "Real experiences, when they arrive.",
    "home.readOrWrite": "Read or write a review",
    "home.visitPrefix": "Visit ", "home.comeFindHeading": "Come find your next frame.", "home.getDirections": "Get directions",
    "home.finalEyebrow": "A good frame starts with a good conversation", "home.finalHeading": "Ready to find your perfect frame?",
    "home.finalText": "Visit us, request an eye test, or start a conversation now.", "home.contactUs": "Contact us",
    "empty.updating": "Our collection is being updated.", "empty.visitOrContact": "Please visit our store or contact us for current availability.", "empty.askQuestion": "Ask a question",
    "eyewear.heroEyebrow": "Eyewear collection", "eyewear.heroHeading": "Frames to try, not a cart to fill.",
    "eyewear.heroText": "This is a showcase of possible styles. Ask about a frame and our team can tell you whether it is currently available in store.",
    "eyewear.search": "Search", "eyewear.searchPlaceholder": "Search frames", "eyewear.category": "Category", "eyewear.allCategories": "All categories",
    "eyewear.shape": "Shape", "eyewear.anyShape": "Any shape", "eyewear.material": "Material", "eyewear.anyMaterial": "Any material",
    "eyewear.ageGroup": "Age group", "eyewear.anyAge": "Any age",
    "eyewear.resultCount": (n) => n + " frame" + (n === 1 ? "" : "s") + " to explore",
    "product.backToCollection": "<- Back to collection", "product.askAbout": "Ask about this frame", "product.whatsappUs": "WhatsApp us",
    "product.askInStore": "Ask in store", "product.uncategorized": "Uncategorized", "product.untitled": "Untitled frame",
    "spec.ageGroup": "Age group", "spec.frameShape": "Frame shape", "spec.material": "Material", "spec.colour": "Colour",
    "services.heroEyebrow": "Services", "services.heroHeading": "Careful guidance, without the hard sell.",
    "services.heroText": "We explain in-store options clearly, and only list services your store has chosen to provide.",
    "services.finalEyebrow": "Let's make it easy", "services.finalHeading": "Need help deciding where to start?",
    "services.finalText": "Message us with a question or request a time for an eye test. We will respond personally.",
    "eyeTest.heroEyebrow": "Eye-test request", "eyeTest.heroHeading": "Choose a time to start the conversation.",
    "eyeTest.heroText": "An appointment request is not an automatic booking. Our team will contact you to confirm your preferred time.",
    "eyeTest.formHeading": "Request an eye test", "eyeTest.formText": "Tell us when might work. Fields marked * are required.",
    "eyeTest.name": "Name *", "eyeTest.phone": "Phone *", "eyeTest.phonePlaceholder": "Your contact number", "eyeTest.email": "Email ",
    "eyeTest.optional": "(optional)", "eyeTest.preferredDate": "Preferred date *", "eyeTest.preferredTime": "Preferred time *",
    "eyeTest.selectTime": "Select a time", "eyeTest.morning": "Morning", "eyeTest.afternoon": "Afternoon", "eyeTest.evening": "Evening", "eyeTest.flexible": "Flexible",
    "eyeTest.ageGroup": "Age group *", "eyeTest.selectAge": "Select age group", "eyeTest.kids": "Kids", "eyeTest.adults": "Adults", "eyeTest.seniors": "Seniors",
    "eyeTest.anythingElse": "Anything else we should know?", "eyeTest.optionalMessage": "Optional message", "eyeTest.send": "Send appointment request",
    "form.agreeNotice": "By submitting, you agree that we may use these details to contact you about this appointment request. See our ",
    "form.privacyLink": "privacy policy",
    "contact.preferTalk": "Prefer to talk?", "contact.hereForYou": "We're here.", "contact.callOrMessage": "Call or message us for a quicker conversation.",
    "contact.getDirections": "Get directions",
    "contact.heroEyebrow": "Contact", "contact.heroHeading": "Come in, call, or send us a note.",
    "contact.heroText": "We are a local optical store built around in-person support. Use whichever channel feels easiest for you.",
    "contact.findUs": "Find us",
    "inquiry.askAboutFrame": "Ask about this frame", "inquiry.sendInquiry": "Send an inquiry",
    "inquiry.willInclude": (name) => "Your inquiry will include " + name + ".", "inquiry.tellUs": "Tell us what you are looking for. We will get back to you soon.",
    "inquiry.name": "Name *", "inquiry.phone": "Phone number *", "inquiry.email": "Email *", "inquiry.type": "Inquiry type *", "inquiry.selectType": "Select a type",
    "inquiry.interestedProduct": "Interested product ", "inquiry.frameNamePlaceholder": "Frame name, if applicable",
    "inquiry.message": "Message *", "inquiry.messagePlaceholder": "How can we help?", "inquiry.send": "Send inquiry",
    "form.privacyNotice": "We use this information only to respond to your inquiry. ",
    "about.heroEyebrow": "About us", "about.heroHeading": "A new local space for clearer choices.",
    "about.heroText": "This is intentionally a placeholder story, replace it with the owner's words before launch.",
    "about.ourStoryEyebrow": "Our story", "about.warmWelcome": "Starting with a warm welcome.",
    "about.ourVision": "Our vision", "about.ourApproach": "Our approach", "about.philosophy": "Eye-care philosophy",
    "reviews.heroEyebrow": "Reviews", "reviews.heroHeading": "Your experience matters.",
    "reviews.heroText": "Reviews are submitted to the store team first and only appear here after approval.",
    "reviews.countApproved": (n) => n + " approved review" + (n === 1 ? "" : "s"), "reviews.noApproved": "No approved reviews yet",
    "reviews.writeReview": "Write a review", "reviews.thankYou": "Thank you for taking the time. Your review will be submitted for approval before it is displayed publicly.",
    "reviews.beFirst": "Be one of our first customers to share your experience.", "reviews.onlyApproved": "We only show reviews once the store team has reviewed and approved them.",
    "reviewForm.name": "Name *", "reviewForm.rating": "Rating *", "reviewForm.selectRating": "Select a rating",
    "reviewForm.r5": "5 - Excellent", "reviewForm.r4": "4 - Very good", "reviewForm.r3": "3 - Good", "reviewForm.r2": "2 - Fair", "reviewForm.r1": "1 - Needs improvement",
    "reviewForm.review": "Review *", "reviewForm.reviewPlaceholder": "Please share your experience in your own words.", "reviewForm.submit": "Submit for approval",
    "gallery.heroEyebrow": "Gallery", "gallery.heroHeading": "A glimpse inside ", "gallery.heroText": "Photos from the store, added and updated any time by the team, no code required.",
    "gallery.willAppear": "Photos will appear here once the team adds them from the admin panel.", "gallery.all": "All",
    "notFound.eyebrow": "Not found", "notFound.heading": "That page isn't here.", "notFound.text": "Try heading back home or exploring the current eyewear showcase.",
    "notFound.goHome": "Go home", "notFound.viewEyewear": "View eyewear",
    "modal.askAboutFrame": "Ask about a frame", "modal.contactPrefix": "Contact ", "modal.writeReview": "Write a review",
    "modal.reviewNotice": "We will submit this to the store team for approval before it is shown publicly.",
    "toast.checkFields": "Please check the highlighted fields.", "toast.thanksSubmitted": "Thanks! Your submission has been received.",
    "toast.sending": "Sending...", "form.required": "This field is required.", "form.invalidEmail": "Enter a valid email address.", "form.invalidPhone": "Enter a valid phone number.",
    "legal.privacyPolicy": "Privacy policy", "legal.termsConditions": "Terms & conditions",
    "legal.privacyHeading": "A simple approach to your information.", "legal.termsHeading": "A simple agreement for using this site.",
  },
  hi: {
    "nav.home": "होम", "nav.eyewear": "आईवियर", "nav.gallery": "गैलरी", "nav.services": "सेवाएं",
    "nav.eye-test": "नेत्र परीक्षण", "nav.about": "हमारे बारे में", "nav.reviews": "समीक्षाएं", "nav.contact": "संपर्क करें",
    "bookEyeTest": "नेत्र परीक्षण बुक करें", "toggleNav": "मेनू खोलें/बंद करें",
    "footer.explore": "एक्सप्लोर करें", "footer.visitContact": "हमसे मिलें या संपर्क करें", "footer.chatWhatsapp": "व्हाट्सएप पर चैट करें",
    "footer.rights": "सर्वाधिकार सुरक्षित।", "footer.privacy": "गोपनीयता नीति", "footer.terms": "नियम और शर्तें", "footer.admin": "एडमिन",
    "mobile.call": "कॉल करें", "mobile.whatsapp": "व्हाट्सएप", "mobile.directions": "दिशा-निर्देश",
    "home.eyebrowPrefix": "स्थानीय चश्मा . ", "home.exploreEyewear": "आईवियर देखें", "home.bookEyeTest": "नेत्र परीक्षण बुक करें",
    "home.visitStore": "हमारी दुकान पर आएं", "home.callUs": "हमें कॉल करें", "home.whatsapp": "व्हाट्सएप", "home.directions": "दिशा-निर्देश",
    "home.everyFaceEyebrow": "हर चेहरे के लिए, हर दिन", "home.everyFaceHeading": "चश्मा जो आपकी जरूरत को समझे।",
    "home.everyFaceText": "पहनने वालों से शुरुआत करें। हमारा शोरूम कलेक्शन खुद आकर देखने के लिए है, ऑनलाइन खरीदने के लिए नहीं।",
    "home.experienceEyebrow": "एक बेहतर स्टोर अनुभव", "home.experienceHeading": "मददगार, हर तरह से।",
    "home.experienceText": "हम अनुभव को सरल रखते हैं: स्पष्ट विकल्प, आत्मीय सलाह, और फैसला लेने के लिए पर्याप्त समय।",
    "home.reason1Title": "पेशेवर नेत्र परीक्षण", "home.reason1Text": "सुविधाजनक समय पर अपॉइंटमेंट का अनुरोध करें, हमारी टीम आपसे विवरण की पुष्टि करेगी।",
    "home.reason2Title": "हर उम्र के लिए चश्मा", "home.reason2Text": "बच्चों, वयस्कों और बुजुर्गों के लिए आरामदायक आकार देखें।",
    "home.reason3Title": "व्यक्तिगत फ्रेम सलाह", "home.reason3Text": "अपने समय पर, सही फिट और लुक खोजने में व्यावहारिक मदद पाएं।",
    "home.reason4Title": "गुणवत्तापूर्ण लेंस विकल्प", "home.reason4Text": "अपनी रोजमर्रा की जरूरतों के लिए लेंस के प्रकारों के बारे में पूछें।",
    "home.reason5Title": "स्थानीय ग्राहक सहायता", "home.reason5Text": "जब भी मदद चाहिए, आएं, कॉल करें, या संदेश भेजें।",
    "home.testingEyebrow": "नेत्र परीक्षण", "home.testingHeading": "आपकी नजर के लिए अगला कदम, स्पष्ट रूप से।",
    "home.testingText": "ऑनलाइन अपॉइंटमेंट अनुरोध भेजें। हम आपसे संपर्क कर उपयुक्त समय तय करेंगे, यह अपने आप बुक नहीं होता।",
    "home.previewEyebrow": "एक छोटी झलक", "home.previewHeading": "आजमाने लायक फ्रेम्स।",
    "home.previewText": "ये प्रदर्शन के लिए फ्रेम हैं, ऑनलाइन खरीदने के लिए कैटलॉग नहीं। स्टोर में मौजूदा उपलब्धता के बारे में हमसे पूछें।",
    "home.viewAllEyewear": "सभी आईवियर देखें",
    "home.stepsEyebrow": "यह कैसे काम करता है", "home.stepsHeading": "व्यक्तिगत रूप से, चार आसान चरण।",
    "home.step1Title": "स्टोर पर आएं", "home.step1Text": "अंदर आएं, देखें, और हमें बताएं आपको क्या चाहिए।",
    "home.step2Title": "अपनी आंखों की जांच कराएं", "home.step2Text": "अगर नेत्र परीक्षण चाहिए तो अपॉइंटमेंट का अनुरोध करें।",
    "home.step3Title": "अपना फ्रेम चुनें", "home.step3Text": "अपनी सुविधा अनुसार आकार, सामग्री और रंग आजमाएं।",
    "home.step4Title": "लेंस सलाह लें", "home.step4Text": "रोजमर्रा के आराम के लिए विकल्पों पर बात करें।",
    "home.reviewsEyebrow": "ग्राहक समीक्षाएं", "home.reviewsHeading": "असली अनुभव, जैसे-जैसे आते हैं।",
    "home.readOrWrite": "समीक्षा पढ़ें या लिखें",
    "home.visitPrefix": "पधारें ", "home.comeFindHeading": "अपना अगला फ्रेम यहां खोजें।", "home.getDirections": "दिशा-निर्देश पाएं",
    "home.finalEyebrow": "एक अच्छा फ्रेम एक अच्छी बातचीत से शुरू होता है", "home.finalHeading": "अपना परफेक्ट फ्रेम खोजने के लिए तैयार हैं?",
    "home.finalText": "हमसे मिलें, नेत्र परीक्षण का अनुरोध करें, या अभी बातचीत शुरू करें।", "home.contactUs": "संपर्क करें",
    "empty.updating": "हमारा संग्रह अपडेट हो रहा है।", "empty.visitOrContact": "मौजूदा उपलब्धता के लिए कृपया हमारी दुकान पर आएं या संपर्क करें।", "empty.askQuestion": "सवाल पूछें",
    "eyewear.heroEyebrow": "आईवियर संग्रह", "eyewear.heroHeading": "आजमाने के लिए फ्रेम्स, भरने के लिए कार्ट नहीं।",
    "eyewear.heroText": "यह संभावित शैलियों का एक प्रदर्शन है। किसी फ्रेम के बारे में पूछें, हमारी टीम बताएगी कि वह अभी स्टोर में उपलब्ध है या नहीं।",
    "eyewear.search": "खोजें", "eyewear.searchPlaceholder": "फ्रेम खोजें", "eyewear.category": "श्रेणी", "eyewear.allCategories": "सभी श्रेणियां",
    "eyewear.shape": "आकार", "eyewear.anyShape": "कोई भी आकार", "eyewear.material": "सामग्री", "eyewear.anyMaterial": "कोई भी सामग्री",
    "eyewear.ageGroup": "आयु वर्ग", "eyewear.anyAge": "कोई भी उम्र",
    "eyewear.resultCount": (n) => "देखने के लिए " + n + " फ्रेम",
    "product.backToCollection": "<- संग्रह पर वापस जाएं", "product.askAbout": "इस फ्रेम के बारे में पूछें", "product.whatsappUs": "व्हाट्सएप पर संपर्क करें",
    "product.askInStore": "स्टोर में पूछें", "product.uncategorized": "बिना श्रेणी", "product.untitled": "बिना नाम का फ्रेम",
    "spec.ageGroup": "आयु वर्ग", "spec.frameShape": "फ्रेम आकार", "spec.material": "सामग्री", "spec.colour": "रंग",
    "services.heroEyebrow": "सेवाएं", "services.heroHeading": "सावधानीपूर्वक मार्गदर्शन, बिना दबाव के।",
    "services.heroText": "हम स्टोर के विकल्पों को स्पष्ट रूप से समझाते हैं, और केवल वही सेवाएं दिखाते हैं जो स्टोर ने चुनी हैं।",
    "services.finalEyebrow": "आसान बनाते हैं", "services.finalHeading": "शुरुआत कहां से करें, तय नहीं कर पा रहे?",
    "services.finalText": "हमें अपना सवाल भेजें या नेत्र परीक्षण के लिए समय का अनुरोध करें। हम व्यक्तिगत रूप से जवाब देंगे।",
    "eyeTest.heroEyebrow": "नेत्र परीक्षण अनुरोध", "eyeTest.heroHeading": "बातचीत शुरू करने के लिए एक समय चुनें।",
    "eyeTest.heroText": "अपॉइंटमेंट अनुरोध अपने आप बुकिंग नहीं है। हमारी टीम आपके पसंदीदा समय की पुष्टि के लिए संपर्क करेगी।",
    "eyeTest.formHeading": "नेत्र परीक्षण का अनुरोध करें", "eyeTest.formText": "हमें बताएं कौन-सा समय ठीक रहेगा। * चिह्नित फील्ड आवश्यक हैं।",
    "eyeTest.name": "नाम *", "eyeTest.phone": "फोन *", "eyeTest.phonePlaceholder": "आपका संपर्क नंबर", "eyeTest.email": "ईमेल ",
    "eyeTest.optional": "(वैकल्पिक)", "eyeTest.preferredDate": "पसंदीदा तारीख *", "eyeTest.preferredTime": "पसंदीदा समय *",
    "eyeTest.selectTime": "समय चुनें", "eyeTest.morning": "सुबह", "eyeTest.afternoon": "दोपहर", "eyeTest.evening": "शाम", "eyeTest.flexible": "कोई भी समय",
    "eyeTest.ageGroup": "आयु वर्ग *", "eyeTest.selectAge": "आयु वर्ग चुनें", "eyeTest.kids": "बच्चे", "eyeTest.adults": "वयस्क", "eyeTest.seniors": "बुजुर्ग",
    "eyeTest.anythingElse": "क्या हमें कुछ और बताना चाहेंगे?", "eyeTest.optionalMessage": "वैकल्पिक संदेश", "eyeTest.send": "अपॉइंटमेंट अनुरोध भेजें",
    "form.agreeNotice": "सबमिट करके, आप सहमत हैं कि हम इस अपॉइंटमेंट अनुरोध के संबंध में आपसे संपर्क करने के लिए इन विवरणों का उपयोग कर सकते हैं। हमारी ",
    "form.privacyLink": "गोपनीयता नीति देखें",
    "contact.preferTalk": "सीधे बात करना पसंद करते हैं?", "contact.hereForYou": "हम यहीं हैं।", "contact.callOrMessage": "तुरंत बातचीत के लिए हमें कॉल या संदेश करें।",
    "contact.getDirections": "दिशा-निर्देश पाएं",
    "contact.heroEyebrow": "संपर्क करें", "contact.heroHeading": "आएं, कॉल करें, या हमें संदेश भेजें।",
    "contact.heroText": "हम एक स्थानीय ऑप्टिकल स्टोर हैं जो व्यक्तिगत सहायता पर आधारित है। जो भी माध्यम आपको आसान लगे, उसका उपयोग करें।",
    "contact.findUs": "हमें खोजें",
    "inquiry.askAboutFrame": "इस फ्रेम के बारे में पूछें", "inquiry.sendInquiry": "पूछताछ भेजें",
    "inquiry.willInclude": (name) => "आपकी पूछताछ में " + name + " शामिल होगा।", "inquiry.tellUs": "हमें बताएं आप क्या ढूंढ रहे हैं। हम जल्द ही जवाब देंगे।",
    "inquiry.name": "नाम *", "inquiry.phone": "फोन नंबर *", "inquiry.email": "ईमेल *", "inquiry.type": "पूछताछ का प्रकार *", "inquiry.selectType": "एक प्रकार चुनें",
    "inquiry.interestedProduct": "पसंदीदा उत्पाद ", "inquiry.frameNamePlaceholder": "फ्रेम का नाम, यदि लागू हो",
    "inquiry.message": "संदेश *", "inquiry.messagePlaceholder": "हम आपकी कैसे मदद कर सकते हैं?", "inquiry.send": "पूछताछ भेजें",
    "form.privacyNotice": "हम इस जानकारी का उपयोग केवल आपकी पूछताछ का जवाब देने के लिए करते हैं। ",
    "about.heroEyebrow": "हमारे बारे में", "about.heroHeading": "स्पष्ट विकल्पों के लिए एक नया स्थानीय स्थान।",
    "about.heroText": "यह जानबूझकर एक अस्थायी कहानी है, लॉन्च से पहले इसे मालिक के अपने शब्दों से बदलें।",
    "about.ourStoryEyebrow": "हमारी कहानी", "about.warmWelcome": "एक आत्मीय स्वागत के साथ शुरुआत।",
    "about.ourVision": "हमारा उद्देश्य", "about.ourApproach": "हमारा तरीका", "about.philosophy": "नेत्र-देखभाल दर्शन",
    "reviews.heroEyebrow": "समीक्षाएं", "reviews.heroHeading": "आपका अनुभव मायने रखता है।",
    "reviews.heroText": "समीक्षाएं पहले स्टोर टीम को भेजी जाती हैं और स्वीकृति के बाद ही यहां दिखाई जाती हैं।",
    "reviews.countApproved": (n) => n + " स्वीकृत समीक्षा" + (n === 1 ? "" : "एं"), "reviews.noApproved": "अभी तक कोई स्वीकृत समीक्षा नहीं",
    "reviews.writeReview": "समीक्षा लिखें", "reviews.thankYou": "समय देने के लिए धन्यवाद। सार्वजनिक रूप से दिखाए जाने से पहले आपकी समीक्षा स्वीकृति के लिए भेजी जाएगी।",
    "reviews.beFirst": "हमारे पहले ग्राहकों में से एक बनें और अपना अनुभव साझा करें।", "reviews.onlyApproved": "हम समीक्षाएं तभी दिखाते हैं जब स्टोर टीम ने उन्हें देखकर स्वीकृत किया हो।",
    "reviewForm.name": "नाम *", "reviewForm.rating": "रेटिंग *", "reviewForm.selectRating": "एक रेटिंग चुनें",
    "reviewForm.r5": "5 - उत्कृष्ट", "reviewForm.r4": "4 - बहुत अच्छा", "reviewForm.r3": "3 - अच्छा", "reviewForm.r2": "2 - ठीक-ठाक", "reviewForm.r1": "1 - सुधार की जरूरत",
    "reviewForm.review": "समीक्षा *", "reviewForm.reviewPlaceholder": "कृपया अपने शब्दों में अपना अनुभव साझा करें।", "reviewForm.submit": "स्वीकृति के लिए भेजें",
    "gallery.heroEyebrow": "गैलरी", "gallery.heroHeading": "", "gallery.heroText": "स्टोर की तस्वीरें, टीम द्वारा कभी भी जोड़ी और अपडेट की जाती हैं, कोई कोड जरूरी नहीं।",
    "gallery.willAppear": "टीम द्वारा एडमिन पैनल से फोटो जोड़ने के बाद यहां दिखाई देंगी।", "gallery.all": "सभी",
    "notFound.eyebrow": "नहीं मिला", "notFound.heading": "यह पेज यहां नहीं है।", "notFound.text": "होम पेज पर वापस जाएं या मौजूदा आईवियर संग्रह देखें।",
    "notFound.goHome": "होम पर जाएं", "notFound.viewEyewear": "आईवियर देखें",
    "modal.askAboutFrame": "फ्रेम के बारे में पूछें", "modal.contactPrefix": "संपर्क करें ", "modal.writeReview": "समीक्षा लिखें",
    "modal.reviewNotice": "सार्वजनिक रूप से दिखाए जाने से पहले हम इसे स्वीकृति के लिए स्टोर टीम को भेजेंगे।",
    "toast.checkFields": "कृपया हाइलाइट किए गए फील्ड जांचें।", "toast.thanksSubmitted": "धन्यवाद! आपका सबमिशन प्राप्त हो गया है।",
    "toast.sending": "भेजा जा रहा है...", "form.required": "यह फील्ड आवश्यक है।", "form.invalidEmail": "एक मान्य ईमेल पता दर्ज करें।", "form.invalidPhone": "एक मान्य फोन नंबर दर्ज करें।",
    "legal.privacyPolicy": "गोपनीयता नीति", "legal.termsConditions": "नियम और शर्तें",
    "legal.privacyHeading": "आपकी जानकारी के प्रति एक सरल दृष्टिकोण।", "legal.termsHeading": "इस साइट का उपयोग करने के लिए एक सरल समझौता।",
  }
};
function t(key) {
  const args = Array.prototype.slice.call(arguments, 1);
  const entry = (STRINGS[lang] && STRINGS[lang][key] !== undefined) ? STRINGS[lang][key] : STRINGS.en[key];
  const value = entry === undefined ? key : entry;
  return typeof value === "function" ? value.apply(null, args) : value;
}
function setLang(next) { lang = next === "hi" ? "hi" : "en"; localStorage.setItem(LANG_KEY, lang); render(); }

function resizeImage(file, maxDim, quality) {
  maxDim = maxDim || 1400; quality = quality || 0.82;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.onload = () => {
        let width = img.width, height = img.height;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
let runtime = { store: STORE_CONFIG, products: PRODUCTS, services: SERVICES, reviews: [], gallery: [] };

const nav = ["home", "eyewear", "gallery", "services", "eye-test", "about", "reviews", "contact"];

function esc(value) {
  value = value === undefined || value === null ? "" : value;
  return String(value).replace(/[&<>'"]/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
  });
}
function href(route) { return route === "home" ? "#/" : "#" + route; }
function route() { return location.hash.replace(/^#\/?/, "") || "home"; }
function setTitle(title) { document.title = title ? (title + " | " + runtime.store.name) : (runtime.store.name + " - " + runtime.store.tagline); }
function phoneHref() { return "tel:" + esc(runtime.store.phone.replace(/\s/g, "")); }
function waHref(message) { return "https://wa.me/" + esc(runtime.store.whatsapp) + "?text=" + encodeURIComponent(message); }
function defaultMessage(product) { return product ? ("Hi, I am interested in the " + product.name + ". Could you please tell me if it is available?") : "Hi, I found your optical store website and would like to know more about your eyewear."; }
function activeRoute() { return route().split("/")[0]; }
function getProduct(id) { return runtime.products.find(function (p) { return p.id === id; }); }
function enabledServices() { return runtime.services.filter(function (service) { return service.enabled; }); }

function toast(message, error) {
  toastRoot.innerHTML = '<div class="toast ' + (error ? "error" : "") + '" role="status">' + esc(message) + '</div>';
  setTimeout(function () { toastRoot.innerHTML = ""; }, 5000);
}

function langToggle() {
  const nextLang = lang === "en" ? "hi" : "en";
  const label = lang === "en" ? "हिं" : "EN";
  return '<button class="lang-toggle" data-action="set-lang" data-lang="' + nextLang + '" aria-label="Switch language">' + label + '</button>';
}

function layout(content, page) {
  page = page || activeRoute();
  const c = runtime.store;
  const navLinks = nav.map(function (key) { return '<a class="' + (page === key ? "active" : "") + '" href="' + href(key) + '">' + t("nav." + key) + '</a>'; }).join("");
  const drawerLinks = nav.map(function (key) { return '<a href="' + href(key) + '" data-action="close-menu">' + t("nav." + key) + '</a>'; }).join("");
  return '<div class="page-shell">' +
    '<div class="announcement">' + esc(c.announcement) + '</div>' +
    '<header class="site-header"><nav class="nav container" aria-label="Primary navigation">' +
    '<a class="brand" href="#/" aria-label="' + esc(c.name) + ' home"><span class="brand-mark" aria-hidden="true"></span><span>' + esc(c.name) + '</span></a>' +
    '<div class="nav-links">' + navLinks + '</div>' + langToggle() +
    '<a class="button button--amber button--small" href="#eye-test">' + t("bookEyeTest") + '</a>' +
    '<button class="mobile-menu" data-action="toggle-menu" aria-expanded="' + mobileOpen + '" aria-label="' + t("toggleNav") + '">' + (mobileOpen ? "\u00d7" : "\u2630") + '</button>' +
    '</nav></header>' +
    '<nav class="mobile-drawer ' + (mobileOpen ? "open" : "") + '" aria-label="Mobile navigation">' + drawerLinks +
    '<a class="button button--amber" href="#eye-test" data-action="close-menu">' + t("bookEyeTest") + '</a>' + langToggle() + '</nav>' +
    '<main id="main-content">' + content + '</main>' + footer() + mobileContact() + '</div>';
}

function footer() {
  const c = runtime.store;
  const links = nav.map(function (key) { return '<a href="' + href(key) + '">' + t("nav." + key) + '</a>'; }).join("");
  const hours = c.openingHours.map(function (item) { return '<span>' + esc(item[0]) + ': ' + esc(item[1]) + '</span>'; }).join("");
  return '<footer class="site-footer"><div class="container footer-grid">' +
    '<div><a class="brand" href="#/"><span class="brand-mark" aria-hidden="true"></span><span>' + esc(c.name) + '</span></a><p class="footer-copy">' + esc(c.description) + '</p></div>' +
    '<div><h2 class="footer-title">' + t("footer.explore") + '</h2><div class="footer-links">' + links + '</div></div>' +
    '<div><h2 class="footer-title">' + t("footer.visitContact") + '</h2><div class="footer-contact"><a href="' + phoneHref() + '">' + esc(c.phone) + '</a><a href="' + waHref(defaultMessage()) + '" target="_blank" rel="noopener">' + t("footer.chatWhatsapp") + '</a><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a><span>' + esc(c.address) + '</span>' + hours + '</div></div></div>' +
    '<div class="container footer-bottom"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(c.name) + '. ' + t("footer.rights") + '</span><a href="#privacy">' + t("footer.privacy") + '</a><a href="#terms">' + t("footer.terms") + '</a><a href="#admin">' + t("footer.admin") + '</a></div></footer>';
}

function mobileContact() {
  const c = runtime.store;
  return '<nav class="mobile-contact" aria-label="Quick contact"><a href="' + phoneHref() + '"><span>\u25d4</span><span>' + t("mobile.call") + '</span></a><a href="' + waHref(defaultMessage()) + '" target="_blank" rel="noopener"><span>\u25cc</span><span>' + t("mobile.whatsapp") + '</span></a><a href="' + esc(c.mapUrl) + '" target="_blank" rel="noopener"><span>\u2316</span><span>' + t("mobile.directions") + '</span></a></nav>';
}

function pageHero(eyebrow, heading, text) {
  return '<section class="page-hero"><div class="container"><p class="eyebrow">' + esc(eyebrow) + '</p><h1>' + esc(heading) + '</h1><p>' + esc(text) + '</p></div></section>';
}

function productImageStyle(product) {
  return product.image
    ? "background-image:url('" + esc(product.image) + "');background-size:cover;background-position:center"
    : "--img-pos:" + esc(product.imagePosition);
}
function productName(product) { return product.name || t("product.untitled"); }
function metaLine(parts) { return parts.filter(Boolean).join(" . "); }
function productCard(product) {
  const meta = metaLine([product.shape ? (product.shape + " frame") : "", product.color]);
  return '<article class="card product-card"><a class="product-image" href="#product/' + encodeURIComponent(product.id) + '" style="' + productImageStyle(product) + '" aria-label="View ' + esc(productName(product)) + '"></a>' +
    '<div class="product-content"><span class="pill pill--soft">' + esc(categoryTitle(product.category)) + '</span><h3>' + esc(productName(product)) + '</h3>' + (meta ? ('<p>' + esc(meta) + '</p>') : "") +
    '<div class="product-meta"><span class="pill pill--warm">' + esc(product.availability || t("product.askInStore")) + '</span></div>' +
    '<button class="button button--ghost button--small" data-action="inquire" data-product="' + esc(product.id) + '">' + t("product.askAbout") + '</button></div></article>';
}
function categoryTitle(id) { const found = CATEGORIES.find(function (c) { return c.id === id; }); return found ? found.title : t("product.uncategorized"); }
function categoryCard(category, i) {
  const positions = ["0% 42%", "24% 52%", "48% 55%", "74% 50%", "100% 55%"];
  return '<a href="#eyewear" class="category-card" style="--pos:' + positions[i] + '"><h3>' + esc(category.title) + '</h3><p>' + esc(category.description) + '</p><span class="card-arrow" aria-hidden="true">\u2197</span></a>';
}
function reviewList(reviewsArr, compact) {
  if (!reviewsArr.length) return '<div class="empty-review"><div><div class="stars" aria-label="No ratings yet">\u2605\u2605\u2605\u2605\u2605</div><h3>' + t("reviews.beFirst") + '</h3><p>' + t("reviews.onlyApproved") + '</p><button class="button button--primary" data-action="review">' + t("reviews.writeReview") + '</button></div></div>';
  const list = compact ? reviewsArr.slice(0, 3) : reviewsArr;
  return '<div class="review-list">' + list.map(function (review) {
    return '<article class="card review-card"><div class="stars" aria-label="' + review.rating + ' out of 5 stars">' + "\u2605".repeat(review.rating) + "\u2606".repeat(5 - review.rating) + '</div><h3>' + esc(review.name) + '</h3><p>' + esc(review.review) + '</p></article>';
  }).join("") + '</div>';
}

function home() {
  const c = runtime.store;
  const reasons = [
    ["\u25ce", t("home.reason1Title"), t("home.reason1Text")], ["\u25c7", t("home.reason2Title"), t("home.reason2Text")],
    ["\u25cc", t("home.reason3Title"), t("home.reason3Text")], ["\u25cd", t("home.reason4Title"), t("home.reason4Text")],
    ["\u2601", t("home.reason5Title"), t("home.reason5Text")]
  ];
  const steps = [[t("home.step1Title"), t("home.step1Text")], [t("home.step2Title"), t("home.step2Text")], [t("home.step3Title"), t("home.step3Text")], [t("home.step4Title"), t("home.step4Text")]];
  const featured = runtime.products.filter(function (product) { return product.featured; }).slice(0, 4);
  const hoursHtml = c.openingHours.map(function (hours) { return esc(hours[0]) + ': ' + esc(hours[1]); }).join("<br>");
  return layout(
    '<section class="hero"><img class="hero-image" src="' + esc(c.heroImage) + '" alt="Customer trying on glasses with guidance inside a modern optical store" fetchpriority="high"><div class="container"><div class="hero-copy"><p class="eyebrow">' + t("home.eyebrowPrefix") + esc(c.locationLabel) + '</p><h1>' + esc(c.heroTitle).replace("\n", "<br>") + '</h1><p>' + esc(c.heroDescription) + '</p><div class="hero-actions"><a class="button button--light" href="#eyewear">' + t("home.exploreEyewear") + ' <span>\u2197</span></a><a class="button button--amber" href="#eye-test">' + t("home.bookEyeTest") + '</a><a class="button button--ghost" style="color:#fff;border-color:#bfc6bc" href="#contact">' + t("home.visitStore") + '</a></div></div></div></section>' +
    '<section class="quick-actions" aria-label="Quick contact"><a href="' + phoneHref() + '"><span class="symbol">\u25d4</span><span>' + t("home.callUs") + '</span></a><a href="' + waHref(defaultMessage()) + '" target="_blank" rel="noopener"><span class="symbol">\u25cc</span><span>' + t("home.whatsapp") + '</span></a><a href="' + esc(c.mapUrl) + '" target="_blank" rel="noopener"><span class="symbol">\u2316</span><span>' + t("home.directions") + '</span></a></section>' +
    '<section class="section section--paper"><div class="container"><div class="section-heading"><p class="eyebrow">' + t("home.everyFaceEyebrow") + '</p><h2>' + t("home.everyFaceHeading") + '</h2><p>' + t("home.everyFaceText") + '</p></div><div class="category-grid">' + CATEGORIES.map(categoryCard).join("") + '</div></div></section>' +
    '<section class="section section--cream"><div class="container"><div class="section-heading"><p class="eyebrow">' + t("home.experienceEyebrow") + '</p><h2>' + t("home.experienceHeading") + '</h2><p>' + t("home.experienceText") + '</p></div><div class="reason-grid">' + reasons.map(function (r) { return '<article class="card reason"><div class="reason-icon">' + r[0] + '</div><h3>' + r[1] + '</h3><p>' + r[2] + '</p></article>'; }).join("") + '</div></div></section>' +
    '<section class="section section--paper"><div class="container"><div class="testing-band"><p class="eyebrow">' + t("home.testingEyebrow") + '</p><h2>' + t("home.testingHeading") + '</h2><p>' + t("home.testingText") + '</p><a class="button button--amber" href="#eye-test">' + t("home.bookEyeTest") + '</a></div></div></section>' +
    '<section class="section section--cream"><div class="container"><div class="section-heading"><p class="eyebrow">' + t("home.previewEyebrow") + '</p><h2>' + t("home.previewHeading") + '</h2><p>' + t("home.previewText") + '</p></div><div class="featured-grid">' + (featured.length ? featured.map(productCard).join("") : emptyProducts()) + '</div><div style="margin-top:1.3rem"><a class="button button--ghost" href="#eyewear">' + t("home.viewAllEyewear") + '</a></div></div></section>' +
    '<section class="section section--ink"><div class="container"><div class="section-heading"><p class="eyebrow">' + t("home.stepsEyebrow") + '</p><h2>' + t("home.stepsHeading") + '</h2></div><div class="process">' + steps.map(function (s) { return '<article class="process-item"><div><h3>' + s[0] + '</h3><p>' + s[1] + '</p></div></article>'; }).join("") + '</div></div></section>' +
    '<section class="section section--paper"><div class="container"><div class="section-heading"><p class="eyebrow">' + t("home.reviewsEyebrow") + '</p><h2>' + t("home.reviewsHeading") + '</h2></div>' + reviewList(runtime.reviews, true) + '<div style="margin-top:1.2rem"><a class="button button--ghost" href="#reviews">' + t("home.readOrWrite") + '</a></div></div></section>' +
    '<section class="section section--cream"><div class="container"><div class="store-preview"><div class="store-preview-image" role="img" aria-label="A warm modern optical store interior"></div><div class="store-preview-copy"><p class="eyebrow">' + t("home.visitPrefix") + esc(c.name) + '</p><h2>' + t("home.comeFindHeading") + '</h2><div class="store-details"><div class="store-detail"><span>\u2316</span><span>' + esc(c.address) + '</span></div><div class="store-detail"><span>\u25d4</span><a href="' + phoneHref() + '">' + esc(c.phone) + '</a></div><div class="store-detail"><span>\u25f7</span><span>' + hoursHtml + '</span></div></div><a class="button button--primary" href="' + esc(c.mapUrl) + '" target="_blank" rel="noopener">' + t("home.getDirections") + ' <span>\u2197</span></a></div></div></div></section>' +
    '<section class="section section--ink"><div class="container final-cta"><p class="eyebrow">' + t("home.finalEyebrow") + '</p><h2>' + t("home.finalHeading") + '</h2><p>' + t("home.finalText") + '</p><div class="hero-actions"><a class="button button--light" href="#contact">' + t("home.visitStore") + '</a><a class="button button--amber" href="#eye-test">' + t("home.bookEyeTest") + '</a><button class="button button--ghost" style="color:white;border-color:#a2ada3" data-action="inquiry">' + t("home.contactUs") + '</button></div></div></section>',
    "home"
  );
}

function emptyProducts() { return '<div class="empty-review"><div><h3>' + t("empty.updating") + '</h3><p>' + t("empty.visitOrContact") + '</p><button class="button button--primary" data-action="inquiry">' + t("empty.askQuestion") + '</button></div></div>'; }

function eyewear() {
  const shapes = Array.from(new Set(runtime.products.map(function (p) { return p.shape; }).filter(Boolean)));
  const materials = Array.from(new Set(runtime.products.map(function (p) { return p.material; }).filter(Boolean)));
  const ages = Array.from(new Set(runtime.products.map(function (p) { return p.ageGroup; }).filter(Boolean)));
  return layout(pageHero(t("eyewear.heroEyebrow"), t("eyewear.heroHeading"), t("eyewear.heroText")) +
    '<section class="section section--cream"><div class="container"><form class="filter-bar" id="product-filters" aria-label="Filter eyewear">' +
    '<label>' + t("eyewear.search") + '<input name="query" type="search" placeholder="' + t("eyewear.searchPlaceholder") + '"></label>' +
    '<label>' + t("eyewear.category") + '<select name="category"><option value="">' + t("eyewear.allCategories") + '</option>' + CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + c.title + '</option>'; }).join("") + '</select></label>' +
    '<label>' + t("eyewear.shape") + '<select name="shape"><option value="">' + t("eyewear.anyShape") + '</option>' + shapes.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join("") + '</select></label>' +
    '<label>' + t("eyewear.material") + '<select name="material"><option value="">' + t("eyewear.anyMaterial") + '</option>' + materials.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join("") + '</select></label>' +
    '<label>' + t("eyewear.ageGroup") + '<select name="ageGroup"><option value="">' + t("eyewear.anyAge") + '</option>' + ages.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join("") + '</select></label>' +
    '</form><p class="collection-result" id="collection-result"></p><div id="collection-grid" class="collection-grid"></div></div></section>', "eyewear");
}

function renderCollection(products) {
  products = products || runtime.products;
  const result = document.querySelector("#collection-result");
  const grid = document.querySelector("#collection-grid");
  if (!grid) return;
  result.textContent = t("eyewear.resultCount", products.length);
  grid.innerHTML = products.length ? products.map(productCard).join("") : emptyProducts();
}
function attachCollectionFilters() {
  const filter = document.querySelector("#product-filters");
  if (!filter) return;
  const update = function () {
    const values = Object.fromEntries(new FormData(filter));
    const query = values.query.trim().toLowerCase();
    renderCollection(runtime.products.filter(function (product) {
      return (!query || (product.name + " " + product.style + " " + product.color).toLowerCase().includes(query)) &&
        (!values.category || product.category === values.category) &&
        (!values.shape || product.shape === values.shape) &&
        (!values.material || product.material === values.material) &&
        (!values.ageGroup || product.ageGroup === values.ageGroup);
    }));
  };
  filter.addEventListener("input", update); filter.addEventListener("change", update); update();
}

function productPage(id) {
  const product = getProduct(id);
  if (!product) return notFound();
  const specs = [[t("spec.ageGroup"), product.ageGroup], [t("spec.frameShape"), product.shape], [t("spec.material"), product.material], [t("spec.colour"), product.color]].filter(function (pair) { return pair[1]; });
  const specsHtml = specs.length ? ('<dl class="spec-list">' + specs.map(function (pair) { return '<div><dt>' + pair[0] + '</dt><dd>' + esc(pair[1]) + '</dd></div>'; }).join("") + '</dl>') : "";
  return layout('<section class="product-page"><div class="container"><a class="back-link" href="#eyewear">' + t("product.backToCollection") + '</a><div class="product-detail"><div class="product-detail-image" style="' + productImageStyle(product) + '" role="img" aria-label="' + esc(productName(product)) + ' showcase frame"></div><div><span class="pill pill--soft">' + esc(categoryTitle(product.category)) + '</span><h1>' + esc(productName(product)) + '</h1>' + (product.description ? ('<p>' + esc(product.description) + '</p>') : "") + specsHtml + '<p><span class="pill pill--warm">' + esc(product.availability || t("product.askInStore")) + '</span></p><div class="hero-actions"><button class="button button--primary" data-action="inquire" data-product="' + esc(product.id) + '">' + t("product.askAbout") + '</button><a class="button button--ghost" href="' + waHref(defaultMessage(product)) + '" target="_blank" rel="noopener">' + t("product.whatsappUs") + '</a></div></div></div></div></section>', "eyewear");
}

function services() {
  const list = enabledServices().map(function (service) { return '<article class="card service-card"><div class="reason-icon">' + service.icon + '</div><div><h3>' + esc(service.title) + '</h3><p>' + esc(service.description) + '</p></div></article>'; }).join("");
  return layout(pageHero(t("services.heroEyebrow"), t("services.heroHeading"), t("services.heroText")) +
    '<section class="section section--cream"><div class="container"><div class="service-list">' + list + '</div></div></section>' +
    '<section class="section section--ink"><div class="container final-cta"><p class="eyebrow">' + t("services.finalEyebrow") + '</p><h2>' + t("services.finalHeading") + '</h2><p>' + t("services.finalText") + '</p><div class="hero-actions"><button class="button button--light" data-action="inquiry">' + t("empty.askQuestion") + '</button><a class="button button--amber" href="#eye-test">' + t("home.bookEyeTest") + '</a></div></div></section>', "services");
}

function appointmentPage() {
  return layout(pageHero(t("eyeTest.heroEyebrow"), t("eyeTest.heroHeading"), t("eyeTest.heroText")) +
    '<section class="section section--cream"><div class="container form-layout">' + appointmentForm() + contactPanel() + '</div></section>', "eye-test");
}
function appointmentForm() {
  return '<form class="card form-card" data-form="appointment" novalidate><h2>' + t("eyeTest.formHeading") + '</h2><p>' + t("eyeTest.formText") + '</p><div class="form-grid">' +
    '<div class="form-grid form-grid--two"><label>' + t("eyeTest.name") + '<input name="name" autocomplete="name" required><small class="field-error"></small></label>' +
    '<label>' + t("eyeTest.phone") + '<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="' + t("eyeTest.phonePlaceholder") + '" required><small class="field-error"></small></label></div>' +
    '<label>' + t("eyeTest.email") + '<span>' + t("eyeTest.optional") + '</span><input name="email" type="email" autocomplete="email"><small class="field-error"></small></label>' +
    '<div class="form-grid form-grid--two"><label>' + t("eyeTest.preferredDate") + '<input name="preferredDate" type="date" required><small class="field-error"></small></label>' +
    '<label>' + t("eyeTest.preferredTime") + '<select name="preferredTime" required><option value="">' + t("eyeTest.selectTime") + '</option><option>' + t("eyeTest.morning") + '</option><option>' + t("eyeTest.afternoon") + '</option><option>' + t("eyeTest.evening") + '</option><option>' + t("eyeTest.flexible") + '</option></select><small class="field-error"></small></label></div>' +
    '<label>' + t("eyeTest.ageGroup") + '<select name="ageGroup" required><option value="">' + t("eyeTest.selectAge") + '</option><option>' + t("eyeTest.kids") + '</option><option>' + t("eyeTest.adults") + '</option><option>' + t("eyeTest.seniors") + '</option></select><small class="field-error"></small></label>' +
    '<label>' + t("eyeTest.anythingElse") + '<textarea name="message" placeholder="' + t("eyeTest.optionalMessage") + '"></textarea></label>' +
    '<button class="button button--primary" type="submit">' + t("eyeTest.send") + '</button></div><p class="form-note">' + t("form.agreeNotice") + '<a href="#privacy"><u>' + t("form.privacyLink") + '</u></a>.</p></form>';
}

function contactPanel() {
  const c = runtime.store;
  return '<aside class="contact-panel"><p class="eyebrow">' + t("contact.preferTalk") + '</p><h2>' + t("contact.hereForYou") + '</h2><p>' + t("contact.callOrMessage") + '</p><div class="store-detail"><span>\u25d4</span><a href="' + phoneHref() + '">' + esc(c.phone) + '</a></div><div class="store-detail"><span>\u2316</span><span>' + esc(c.address) + '</span></div><a class="button button--amber" href="' + waHref(defaultMessage()) + '" target="_blank" rel="noopener">' + t("footer.chatWhatsapp") + '</a><a class="button button--light" href="' + esc(c.mapUrl) + '" target="_blank" rel="noopener">' + t("contact.getDirections") + '</a></aside>';
}

function contact() {
  const c = runtime.store;
  const hoursHtml = c.openingHours.map(function (hours) { return esc(hours[0]) + ': ' + esc(hours[1]); }).join("<br>");
  return layout(pageHero(t("contact.heroEyebrow"), t("contact.heroHeading"), t("contact.heroText")) +
    '<section class="section section--cream"><div class="container form-layout"><div class="contact-panel"><p class="eyebrow">' + t("contact.findUs") + '</p><h2>' + esc(c.name) + '</h2><div class="store-detail"><span>\u2316</span><span>' + esc(c.address) + '</span></div><div class="store-detail"><span>\u25d4</span><a href="' + phoneHref() + '">' + esc(c.phone) + '</a></div><div class="store-detail"><span>\u25cc</span><a href="' + waHref(defaultMessage()) + '" target="_blank" rel="noopener">' + t("footer.chatWhatsapp") + '</a></div><div class="store-detail"><span>\u2709</span><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></div><div class="store-detail"><span>\u25f7</span><span>' + hoursHtml + '</span></div><a class="button button--amber" href="' + esc(c.mapUrl) + '" target="_blank" rel="noopener">' + t("contact.getDirections") + '</a></div>' + inquiryForm() + '</div></section>', "contact");
}
function inquiryForm(product) {
  const heading = product ? t("inquiry.askAboutFrame") : t("inquiry.sendInquiry");
  const sub = product ? t("inquiry.willInclude", esc(product.name)) : t("inquiry.tellUs");
  const options = INQUIRY_TYPES.map(function (type) { return '<option ' + (product && type === "Frame Availability" ? "selected" : "") + '>' + esc(type) + '</option>'; }).join("");
  return '<form class="card form-card" data-form="inquiry" novalidate><h2>' + heading + '</h2><p>' + sub + '</p><div class="form-grid">' +
    '<div class="form-grid form-grid--two"><label>' + t("inquiry.name") + '<input name="name" autocomplete="name" required><small class="field-error"></small></label>' +
    '<label>' + t("inquiry.phone") + '<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required><small class="field-error"></small></label></div>' +
    '<label>' + t("inquiry.email") + '<input name="email" type="email" autocomplete="email" required><small class="field-error"></small></label>' +
    '<label>' + t("inquiry.type") + '<select name="type" required><option value="">' + t("inquiry.selectType") + '</option>' + options + '</select><small class="field-error"></small></label>' +
    '<label>' + t("inquiry.interestedProduct") + '<span>' + t("eyeTest.optional") + '</span><input name="product" value="' + esc(product && product.name || "") + '" ' + (product ? "readonly" : "") + ' placeholder="' + t("inquiry.frameNamePlaceholder") + '"></label>' +
    '<label>' + t("inquiry.message") + '<textarea name="message" required placeholder="' + t("inquiry.messagePlaceholder") + '"></textarea><small class="field-error"></small></label>' +
    '<button class="button button--primary" type="submit">' + t("inquiry.send") + '</button></div><p class="form-note">' + t("form.privacyNotice") + '<a href="#privacy"><u>' + t("form.privacyLink") + '</u></a>.</p></form>';
}

function about() {
  const a = runtime.store.about;
  return layout(pageHero(t("about.heroEyebrow"), t("about.heroHeading"), t("about.heroText")) +
    '<section class="section section--cream"><div class="container about-grid"><div class="about-image" role="img" aria-label="Customer looking at eyewear with an optical professional"></div><div class="prose">' +
    '<section><p class="eyebrow">' + t("about.ourStoryEyebrow") + '</p><h2>' + t("about.warmWelcome") + '</h2><p>' + esc(a.story) + '</p></section>' +
    '<section><h2>' + t("about.ourVision") + '</h2><p>' + esc(a.vision) + '</p></section>' +
    '<section><h2>' + t("about.ourApproach") + '</h2><p>' + esc(a.approach) + '</p></section>' +
    '<section><h2>' + t("about.philosophy") + '</h2><p>' + esc(a.philosophy) + '</p></section></div></div></section>', "about");
}

function reviews() {
  const count = runtime.reviews.length;
  const average = count ? (runtime.reviews.reduce(function (total, r) { return total + r.rating; }, 0) / count).toFixed(1) : "\u2014";
  return layout(pageHero(t("reviews.heroEyebrow"), t("reviews.heroHeading"), t("reviews.heroText")) +
    '<section class="section section--cream"><div class="container form-layout"><div><div class="rating-summary"><strong>' + average + '</strong><div class="stars">\u2605\u2605\u2605\u2605\u2605</div><p>' + (count ? t("reviews.countApproved", count) : t("reviews.noApproved")) + '</p></div>' + reviewList(runtime.reviews, false) + '</div><div class="card form-card"><h2>' + t("reviews.writeReview") + '</h2><p>' + t("reviews.thankYou") + '</p>' + reviewForm() + '</div></div></section>', "reviews");
}
function reviewForm() {
  return '<form data-form="review" novalidate><div class="form-grid"><label>' + t("reviewForm.name") + '<input name="name" autocomplete="name" required><small class="field-error"></small></label>' +
    '<label>' + t("reviewForm.rating") + '<select name="rating" required><option value="">' + t("reviewForm.selectRating") + '</option><option value="5">' + t("reviewForm.r5") + '</option><option value="4">' + t("reviewForm.r4") + '</option><option value="3">' + t("reviewForm.r3") + '</option><option value="2">' + t("reviewForm.r2") + '</option><option value="1">' + t("reviewForm.r1") + '</option></select><small class="field-error"></small></label>' +
    '<label>' + t("reviewForm.review") + '<textarea name="review" required placeholder="' + t("reviewForm.reviewPlaceholder") + '"></textarea><small class="field-error"></small></label>' +
    '<button class="button button--primary" type="submit">' + t("reviewForm.submit") + '</button></div></form>';
}

const GALLERY_CATEGORIES = ["Store exterior", "Store interior", "Eye-testing room", "Staff", "New collections", "Events"];

function gallery() {
  const items = runtime.gallery || [];
  const categories = [t("gallery.all")].concat(GALLERY_CATEGORIES.filter(function (cat) { return items.some(function (item) { return item.category === cat; }); }));
  const chips = items.length ? ('<div class="filter-row">' + categories.map(function (cat) { return '<button class="chip ' + (cat === t("gallery.all") ? "active" : "") + '" data-gallery-filter="' + esc(cat) + '">' + esc(cat) + '</button>'; }).join("") + '</div>') : "";
  const grid = items.length ? items.map(galleryTile).join("") : ('<p class="admin-empty">' + t("gallery.willAppear") + '</p>');
  return layout(pageHero(t("gallery.heroEyebrow"), t("gallery.heroHeading") + esc(runtime.store.name), t("gallery.heroText")) +
    '<section class="section section--cream"><div class="container">' + chips + '<div class="gallery-grid" id="gallery-grid">' + grid + '</div></div></section>', "gallery");
}
function galleryTile(item) {
  return '<button class="gallery-item" type="button" data-action="view-gallery-item" data-id="' + item.id + '" data-category="' + esc(item.category || "") + '" style="background-image:url(\'' + esc(item.image) + '\');background-size:cover;background-position:center" aria-label="' + esc(item.title || "Gallery photo") + '">' + (!item.title ? "" : ('<span>' + esc(item.title) + '</span>')) + '</button>';
}
function attachGalleryFilters() {
  const chips = document.querySelectorAll("[data-gallery-filter]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const category = chip.dataset.galleryFilter;
      chips.forEach(function (c) { c.classList.toggle("active", c === chip); });
      document.querySelectorAll("#gallery-grid .gallery-item").forEach(function (tile) {
        tile.style.display = (category === t("gallery.all") || tile.dataset.category === category) ? "" : "none";
      });
    });
  });
}
function galleryModal(item) {
  return '<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" data-modal-content><div class="modal-top"><h2>' + esc(item.title || "Gallery photo") + '</h2><button class="close-modal" data-action="close-modal" aria-label="Close">\u00d7</button></div><div style="width:100%;aspect-ratio:4/3;background-image:url(\'' + esc(item.image) + '\');background-size:cover;background-position:center;border-radius:.75rem"></div>' + (item.description ? ('<p style="margin-top:1rem">' + esc(item.description) + '</p>') : "") + '</div></div>';
}

function legal(kind) {
  const privacy = kind === "privacy";
  const body = privacy
    ? '<h2>What we collect</h2><p>When you submit an inquiry, appointment request, or review, we collect the details shown on that form. We use them only to respond to your request, manage the appointment or review, and improve store service.</p><h2>How we use it</h2><p>We do not publish reviews until the store team approves them. We do not sell personal information. We may retain submissions for reasonable business record-keeping and customer-service purposes.</p><h2>Contact</h2><p>Contact ' + esc(runtime.store.name) + ' at <a href="mailto:' + esc(runtime.store.email) + '"><u>' + esc(runtime.store.email) + '</u></a> if you have a question about your information. Replace this starter text with advice tailored to your local privacy obligations before launch.</p>'
    : '<h2>Using this website</h2><p>This site provides information about a local optical store, lets visitors request an eye-test appointment, and enables customer inquiries. It does not offer online sales, prices, payments, shipping, or automatic appointment confirmation.</p><h2>Appointment requests</h2><p>An appointment request is not confirmed until the store contacts you directly. Availability may change.</p><h2>Information on this site</h2><p>Frame availability and services can change. Please contact the store or visit in person for current information. Replace this starter text with terms appropriate to your business before launch.</p>';
  return layout('<section class="section section--paper"><article class="container legal"><p class="eyebrow">' + (privacy ? t("legal.privacyPolicy") : t("legal.termsConditions")) + '</p><h1>' + (privacy ? t("legal.privacyHeading") : t("legal.termsHeading")) + '</h1>' + body + '</article></section>', kind);
}

function notFound() {
  return layout('<section class="section section--cream"><div class="container empty-review"><div><p class="eyebrow">' + t("notFound.eyebrow") + '</p><h1>' + t("notFound.heading") + '</h1><p>' + t("notFound.text") + '</p><div class="hero-actions" style="justify-content:center"><a class="button button--primary" href="#/">' + t("notFound.goHome") + '</a><a class="button button--ghost" href="#eyewear">' + t("notFound.viewEyewear") + '</a></div></div></div></section>');
}

function inquiryModal(product) {
  const title = product ? t("modal.askAboutFrame") : (t("modal.contactPrefix") + esc(runtime.store.name));
  return '<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title" data-modal-content><div class="modal-top"><h2 id="inquiry-title">' + title + '</h2><button class="close-modal" data-action="close-modal" aria-label="Close">\u00d7</button></div>' + inquiryForm(product) + '</div></div>';
}
function reviewModal() {
  return '<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="review-title" data-modal-content><div class="modal-top"><h2 id="review-title">' + t("modal.writeReview") + '</h2><button class="close-modal" data-action="close-modal" aria-label="Close">\u00d7</button></div><p>' + t("modal.reviewNotice") + '</p>' + reviewForm() + '</div></div>';
}
function openModal(html) { modalRoot.innerHTML = html; const el = modalRoot.querySelector("input,select,textarea,button"); if (el) el.focus(); }
function closeModal() { modalRoot.innerHTML = ""; }

/* ---------- Admin (kept English-only, a tool for the store operator, not customers) ---------- */
function adminLogin() {
  return '<div class="admin-shell"><header class="admin-head"><a class="brand" href="#/"><span class="brand-mark"></span><span>' + esc(runtime.store.name) + '</span></a><a class="button button--light button--small" href="#/">View website</a></header><main class="admin-login"><form class="card form-card" data-form="login" novalidate><p class="eyebrow">Protected area</p><h2>Store admin</h2><p>Sign in to review inquiries, appointments, and customer reviews.</p><div class="form-grid"><label>Admin password<input name="password" type="password" autocomplete="current-password" required><small class="field-error"></small></label><button class="button button--primary" type="submit">Sign in</button></div><p class="form-note">For security, set <code>ADMIN_PASSWORD</code> and <code>TOKEN_SECRET</code> in your server environment before launch.</p></form></main></div>';
}
function admin() {
  if (!sessionStorage.getItem("visiona-token")) return adminLogin();
  if (!adminData) loadAdmin();
  const data = adminData || { inquiries: [], appointments: [], reviews: [], products: runtime.products, services: runtime.services, gallery: [], store: runtime.store };
  const approved = data.reviews.filter(function (r) { return r.status === "approved"; }).length;
  const tabs = [["overview", "Overview"], ["inquiries", "Inquiries"], ["appointments", "Appointments"], ["reviews", "Reviews"], ["products", "Products"], ["gallery", "Gallery"], ["services", "Services"], ["store", "Store info"], ["content", "Site content"]];
  const tabsHtml = tabs.map(function (pair) { return '<button class="' + (adminTab === pair[0] ? "active" : "") + '" data-action="admin-tab" data-tab="' + pair[0] + '">' + pair[1] + '</button>'; }).join("");
  return '<div class="admin-shell"><header class="admin-head"><a class="brand" href="#/"><span class="brand-mark"></span><span>' + esc(runtime.store.name) + ' . ADMIN</span></a><div style="display:flex;gap:.5rem"><a class="button button--light button--small" href="#/">View site</a><button class="button button--ghost button--small" style="color:white;border-color:#849188" data-action="logout">Sign out</button></div></header><main class="admin-main"><p class="eyebrow">Store workspace</p><h1>Good morning.</h1><div class="admin-tabs">' + tabsHtml + '</div>' + adminContent(data, approved) + '</main></div>';
}
function adminContent(data, approved) {
  if (adminTab === "overview") {
    const newInquiries = data.inquiries.filter(function (x) { return x.status === "new"; }).length;
    const pendingAppt = data.appointments.filter(function (x) { return x.status === "pending"; }).length;
    const pendingReviews = data.reviews.filter(function (x) { return x.status === "pending"; }).length;
    return '<div class="metric-grid"><div class="card metric"><strong>' + newInquiries + '</strong><span>New inquiries</span></div><div class="card metric"><strong>' + pendingAppt + '</strong><span>Pending appointments</span></div><div class="card metric"><strong>' + pendingReviews + '</strong><span>Reviews to review</span></div><div class="card metric"><strong>' + approved + '</strong><span>Approved reviews</span></div></div><section class="card admin-section"><h2>What needs attention</h2><p class="admin-empty">' + ((newInquiries || pendingAppt || pendingReviews) ? "New customer submissions are ready in their respective tabs." : "Nothing is waiting right now. New customer submissions will appear here.") + '</p></section>';
  }
  if (adminTab === "inquiries") return adminTable("Inquiries", data.inquiries, ["Name", "Type", "Message", "Date", "Status"], function (item) {
    return '<tr><td><strong>' + esc(item.name) + '</strong><br>' + esc(item.phone) + '<br>' + esc(item.email) + '</td><td>' + esc(item.type) + '</td><td>' + esc(item.product ? (item.product + ": ") : "") + esc(item.message) + '</td><td>' + formatDate(item.createdAt) + '</td><td><select class="status-select" data-action="update-status" data-kind="inquiries" data-id="' + item.id + '"><option ' + (item.status === "new" ? "selected" : "") + '>new</option><option ' + (item.status === "contacted" ? "selected" : "") + '>contacted</option><option ' + (item.status === "resolved" ? "selected" : "") + '>resolved</option></select></td></tr>';
  });
  if (adminTab === "appointments") return adminTable("Appointment requests", data.appointments, ["Visitor", "Requested time", "Message", "Date", "Status"], function (item) {
    const statuses = ["pending", "contacted", "confirmed", "completed", "cancelled"];
    const options = statuses.map(function (status) { return '<option ' + (item.status === status ? "selected" : "") + '>' + status + '</option>'; }).join("");
    return '<tr><td><strong>' + esc(item.name) + '</strong><br>' + esc(item.phone) + '<br>' + esc(item.email || "\u2014") + '</td><td>' + esc(item.preferredDate) + '<br>' + esc(item.preferredTime) + ' . ' + esc(item.ageGroup) + '</td><td>' + esc(item.message || "\u2014") + '</td><td>' + formatDate(item.createdAt) + '</td><td><select class="status-select" data-action="update-status" data-kind="appointments" data-id="' + item.id + '">' + options + '</select></td></tr>';
  });
  if (adminTab === "reviews") return adminTable("Review moderation", data.reviews, ["Customer", "Rating", "Review", "Submitted", "Actions"], function (item) {
    const actions = item.status === "pending"
      ? ('<button class="button button--primary button--small" data-action="review-status" data-id="' + item.id + '" data-status="approved">Approve</button> <button class="button button--ghost button--small" data-action="review-status" data-id="' + item.id + '" data-status="rejected">Reject</button>')
      : ('<span class="pill ' + (item.status === "approved" ? "pill--soft" : "pill--red") + '">' + esc(item.status) + '</span>');
    return '<tr><td><strong>' + esc(item.name) + '</strong></td><td>' + "\u2605".repeat(item.rating) + '</td><td>' + esc(item.review) + '</td><td>' + formatDate(item.createdAt) + '</td><td>' + actions + ' <button class="button button--danger button--small" data-action="delete-review" data-id="' + item.id + '">Delete</button></td></tr>';
  });
  if (adminTab === "products") {
    const editing = data.products.find(function (p) { return p.id === editingProductId; });
    const rows = data.products.map(function (product) {
      const thumb = product.image ? ('<img src="' + esc(product.image) + '" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:.5rem;flex-shrink:0">') : '<div style="width:56px;height:56px;border-radius:.5rem;background:#e7e2d8;flex-shrink:0"></div>';
      const meta = esc(categoryTitle(product.category)) + (product.shape ? (' . ' + esc(product.shape)) : "") + ' . ' + esc(product.availability || "Ask in store");
      return '<div class="product-admin-row"><div style="display:flex;gap:.75rem;align-items:center">' + thumb + '<div><strong>' + esc(product.name || "Untitled frame") + '</strong><p>' + meta + '</p></div></div><div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="button button--ghost button--small" data-action="edit-product" data-id="' + product.id + '">Edit</button><button class="button button--ghost button--small" data-action="toggle-featured" data-id="' + product.id + '">' + (product.featured ? "Remove feature" : "Feature") + '</button><button class="button button--danger button--small" data-action="delete-product" data-id="' + product.id + '">Delete</button></div></div>';
    }).join("");
    const catOptions = CATEGORIES.map(function (c) { return '<option value="' + c.id + '" ' + (editing && editing.category === c.id ? "selected" : "") + '>' + c.title + '</option>'; }).join("");
    return '<section class="card admin-section"><h2>Showcase products</h2><p class="admin-empty">Products are display and inquiry only. They never become products for online purchase.</p><div class="product-admin">' + rows + '</div></section>' +
      '<section class="card form-card" style="margin-top:1rem"><h2>' + (editing ? ('Edit "' + esc(editing.name || "Untitled frame") + '"') : "Add a showcase frame") + '</h2><p class="admin-empty">Every field below is optional, leave anything blank you do not want to fill in yet.</p><form data-form="product" class="form-grid">' +
      '<div class="form-grid form-grid--two"><label>Frame name<input name="name" value="' + (editing ? esc(editing.name) : "") + '" placeholder="e.g. Horizon Aviator"></label><label>Category <span>(optional)</span><select name="category"><option value="">Uncategorized</option>' + catOptions + '</select></label></div>' +
      '<div class="form-grid form-grid--two"><label>Shape <span>(optional)</span><input name="shape" value="' + (editing ? esc(editing.shape) : "") + '"></label><label>Material <span>(optional)</span><input name="material" value="' + (editing ? esc(editing.material) : "") + '"></label></div>' +
      '<div class="form-grid form-grid--two"><label>Colour <span>(optional)</span><input name="color" value="' + (editing ? esc(editing.color) : "") + '"></label><label>Age group <span>(optional)</span><input name="ageGroup" value="' + (editing ? esc(editing.ageGroup) : "") + '"></label></div>' +
      '<label>Availability<input name="availability" value="' + (editing ? esc(editing.availability) : "Ask in store") + '"></label>' +
      '<label>Description <span>(optional)</span><textarea name="description">' + (editing ? esc(editing.description) : "") + '</textarea></label>' +
      '<label>Photo ' + (editing && editing.image ? "<span>(uploading a new one replaces the current photo)</span>" : "<span>(optional, JPEG, PNG, or WEBP, under 4MB)</span>") + '<input type="file" name="photo" accept="image/png,image/jpeg,image/webp"></label>' +
      '<div style="display:flex;gap:.6rem"><button class="button button--primary" type="submit">' + (editing ? "Save changes" : "Add showcase frame") + '</button>' + (editing ? '<button class="button button--ghost" type="button" data-action="cancel-edit-product">Cancel</button>' : "") + '</div></form></section>';
  }
  if (adminTab === "gallery") {
    const items = data.gallery || [];
    const rows = items.length ? items.map(function (item) {
      return '<div class="product-admin-row"><div style="display:flex;gap:.75rem;align-items:center"><img src="' + esc(item.image) + '" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:.5rem;flex-shrink:0"><div><strong>' + esc(item.title || "Untitled photo") + '</strong><p>' + esc(item.category || "No category") + (item.description ? (' . ' + esc(item.description)) : "") + '</p></div></div><button class="button button--danger button--small" data-action="delete-gallery-item" data-id="' + item.id + '">Delete</button></div>';
    }).join("") : '<p class="admin-empty">No photos yet, add the first one below.</p>';
    const catOptions = GALLERY_CATEGORIES.map(function (cat) { return '<option value="' + esc(cat) + '">' + esc(cat) + '</option>'; }).join("");
    return '<section class="card admin-section"><h2>Gallery photos</h2><p class="admin-empty">Only the photo itself is required, title, description, and category are all optional, skip anything you do not want to fill in.</p><div class="product-admin">' + rows + '</div></section>' +
      '<section class="card form-card" style="margin-top:1rem"><h2>+ Add photo</h2><form data-form="gallery" class="form-grid"><label>Photo *<input type="file" name="photo" accept="image/png,image/jpeg,image/webp" required></label><label>Title <span>(optional)</span><input name="title" placeholder="e.g. Our new frame wall"></label><label>Description <span>(optional)</span><textarea name="description" placeholder="Optional, a line or two about this photo"></textarea></label><label>Category <span>(optional)</span><select name="category"><option value="">No category</option>' + catOptions + '</select></label><button class="button button--primary" type="submit">Publish</button></form></section>';
  }
  if (adminTab === "services") return '<section class="card admin-section"><h2>Services shown publicly</h2><p class="admin-empty">Only enabled services are shown on the Services page.</p><div class="product-admin">' + data.services.map(function (service) {
    return '<div class="product-admin-row"><div><strong>' + esc(service.title) + '</strong><p>' + esc(service.description) + '</p></div><button class="button ' + (service.enabled ? "button--primary" : "button--ghost") + ' button--small" data-action="toggle-service" data-id="' + service.id + '">' + (service.enabled ? "Enabled" : "Disabled") + '</button></div>';
  }).join("") + '</div></section>';
  if (adminTab === "store") {
    const hours = openingHoursDraft || data.store.openingHours;
    const hoursHtml = hours.map(function (pair, i) {
      return '<div style="display:flex;gap:.5rem;margin-bottom:.5rem;align-items:center"><input name="oh-day-' + i + '" value="' + esc(pair[0]) + '" placeholder="e.g. Monday - Saturday" style="flex:1"><input name="oh-hours-' + i + '" value="' + esc(pair[1]) + '" placeholder="e.g. 10:00 AM - 8:00 PM" style="flex:1"><button type="button" class="button button--danger button--small" data-action="remove-hours-row" data-index="' + i + '">Remove</button></div>';
    }).join("");
    return '<section class="card form-card"><h2>Store info</h2><p>Contact details and location shown across the site.</p><form data-form="store" class="form-grid">' +
      '<label>Store name<input name="name" value="' + esc(data.store.name) + '"></label>' +
      '<div class="form-grid form-grid--two"><label>Phone<input name="phone" value="' + esc(data.store.phone) + '" placeholder="+91 8218841976"></label><label>WhatsApp number <span>(digits only, with country code, e.g. 918218841976)</span><input name="whatsapp" value="' + esc(data.store.whatsapp) + '"></label></div>' +
      '<label>Email<input type="email" name="email" value="' + esc(data.store.email) + '"></label>' +
      '<label>Address<input name="address" value="' + esc(data.store.address) + '"></label>' +
      '<label>Google Maps link<input name="mapUrl" value="' + esc(data.store.mapUrl) + '" placeholder="https://maps.google.com/?q=..."></label>' +
      '<div><label style="margin-bottom:.4rem;display:block">Opening hours</label>' + hoursHtml + '<button type="button" class="button button--ghost button--small" data-action="add-hours-row">+ Add day</button></div>' +
      '<button class="button button--primary" type="submit">Save store info</button></form></section>';
  }
  if (adminTab === "content") return '<section class="card form-card"><h2>Homepage content</h2><p>Keep the core message current without changing the site layout.</p><form data-form="store" class="form-grid"><label>Announcement<input name="announcement" value="' + esc(data.store.announcement) + '"></label><label>Hero title<textarea name="heroTitle">' + esc(data.store.heroTitle) + '</textarea></label><label>Hero description<textarea name="heroDescription">' + esc(data.store.heroDescription) + '</textarea></label><button class="button button--primary" type="submit">Save homepage content</button></form></section>';
}
function adminTable(title, items, headers, row) {
  const headerHtml = headers.map(function (header) { return '<th>' + header + '</th>'; }).join("");
  const body = items.length ? ('<div style="overflow-x:auto"><table class="admin-table"><thead><tr>' + headerHtml + '</tr></thead><tbody>' + items.map(row).join("") + '</tbody></table></div>') : '<p class="admin-empty">Nothing here yet.</p>';
  return '<section class="card admin-section"><h2>' + title + '</h2>' + body + '</section>';
}
function formatDate(date) { return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }

async function api(path, options) {
  options = options || {};
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  const token = sessionStorage.getItem("visiona-token");
  if (token) headers.Authorization = "Bearer " + token;
  const response = await fetch(path, Object.assign({}, options, { headers: headers }));
  const payload = await response.json().catch(function () { return {}; });
  if (!response.ok) throw new Error(payload.message || "Something went wrong. Please try again.");
  return payload;
}
function validateForm(form) {
  let valid = true;
  form.querySelectorAll("[required]").forEach(function (input) {
    const label = input.closest("label");
    const error = label ? label.querySelector(".field-error") : null;
    let message = "";
    if (!input.value.trim()) message = t("form.required");
    else if (input.type === "email" && !input.validity.valid) message = t("form.invalidEmail");
    else if (input.name === "phone" && input.value.replace(/\D/g, "").length < 7) message = t("form.invalidPhone");
    if (error) error.textContent = message;
    if (message) valid = false;
  });
  return valid;
}
async function submitCustomerForm(form) {
  if (!validateForm(form)) { toast(t("toast.checkFields"), true); return; }
  const kind = form.dataset.form;
  const endpoint = kind === "appointment" ? "/api/appointments" : kind === "review" ? "/api/reviews" : "/api/inquiries";
  const data = Object.fromEntries(new FormData(form));
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = t("toast.sending");
  try {
    const result = await api(endpoint, { method: "POST", body: JSON.stringify(data) });
    form.reset();
    closeModal();
    toast(result.message || t("toast.thanksSubmitted"));
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = kind === "appointment" ? t("eyeTest.send") : kind === "review" ? t("reviewForm.submit") : t("inquiry.send");
  }
}
async function submitLogin(form) {
  if (!validateForm(form)) return;
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const result = await api("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    sessionStorage.setItem("visiona-token", result.token);
    adminData = null;
    render();
    toast("Signed in.");
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
  }
}
async function submitProduct(form) {
  if (!validateForm(form)) return;
  const button = form.querySelector("button[type=submit]");
  const originalLabel = button.textContent;
  button.disabled = true;
  try {
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[name="photo"]');
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;
    formData.delete("photo");
    const data = Object.fromEntries(formData);
    if (file) {
      button.textContent = "Processing photo...";
      data.imageData = await resizeImage(file);
    }
    if (editingProductId) {
      await api("/api/admin/products/" + editingProductId, { method: "PATCH", body: JSON.stringify(data) });
      toast("Showcase frame updated.");
    } else {
      await api("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
      toast("Showcase frame added.");
    }
    editingProductId = null;
    await loadAdmin();
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}
async function submitStore(form) {
  try {
    const data = Object.fromEntries(new FormData(form));
    const rowIndexes = new Set();
    for (const key of Object.keys(data)) {
      const match = /^oh-(day|hours)-(\d+)$/.exec(key);
      if (match) rowIndexes.add(Number(match[2]));
    }
    if (rowIndexes.size) {
      data.openingHours = Array.from(rowIndexes).sort(function (a, b) { return a - b; }).map(function (i) { return [data["oh-day-" + i] || "", data["oh-hours-" + i] || ""]; });
      rowIndexes.forEach(function (i) { delete data["oh-day-" + i]; delete data["oh-hours-" + i]; });
    }
    const saved = await api("/api/admin/store", { method: "PATCH", body: JSON.stringify(data) });
    runtime.store = saved.store;
    openingHoursDraft = null;
    await loadAdmin();
    toast("Store information saved.");
  } catch (error) {
    toast(error.message, true);
  }
}
async function loadRuntime() {
  try {
    const data = await api("/api/public");
    runtime = Object.assign({}, runtime, data);
    setSchema();
  } catch (e) { /* Static design remains visible if the server is not running. */ }
}
async function loadAdmin() {
  try {
    adminData = await api("/api/admin");
    render();
  } catch (error) {
    if (/author/i.test(error.message)) { sessionStorage.removeItem("visiona-token"); adminData = null; render(); }
    else toast(error.message, true);
  }
}
function setSchema() {
  document.querySelector("#local-business-schema").textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "Optician", name: runtime.store.name, description: runtime.store.description,
    telephone: runtime.store.phone, email: runtime.store.email, address: runtime.store.address,
    openingHours: runtime.store.openingHours.map(function (x) { return x[0] + " " + x[1]; })
  });
}

function render() {
  const current = route();
  if (current === "admin") { app.innerHTML = admin(); return; }
  let content;
  if (current === "home") content = home();
  else if (current === "eyewear") content = eyewear();
  else if (current.startsWith("product/")) content = productPage(decodeURIComponent(current.split("/")[1] || ""));
  else if (current === "services") content = services();
  else if (current === "eye-test") content = appointmentPage();
  else if (current === "contact") content = contact();
  else if (current === "about") content = about();
  else if (current === "reviews") content = reviews();
  else if (current === "gallery") content = gallery();
  else if (current === "privacy" || current === "terms") content = legal(current);
  else content = notFound();
  app.innerHTML = content;
  if (current === "eyewear") attachCollectionFilters();
  if (current === "gallery") attachGalleryFilters();
  setTitle(current === "home" ? "" : current === "eye-test" ? "Book an eye test" : current.charAt(0).toUpperCase() + current.slice(1));
  document.documentElement.lang = lang;
}

document.addEventListener("click", function (event) {
  const target = event.target.closest("[data-action]");
  const action = target ? target.dataset.action : null;
  if (!action) return;
  if (action === "toggle-menu") { mobileOpen = !mobileOpen; render(); }
  if (action === "close-menu") { mobileOpen = false; }
  if (action === "set-lang") { setLang(target.dataset.lang); }
  if (action === "close-modal" && (!event.target.closest("[data-modal-content]") || event.target.matches("[data-action=close-modal]"))) closeModal();
  if (action === "inquire") openModal(inquiryModal(getProduct(target.dataset.product)));
  if (action === "inquiry") openModal(inquiryModal());
  if (action === "review") openModal(reviewModal());
  if (action === "view-gallery-item") { const item = (runtime.gallery || []).find(function (g) { return g.id === target.dataset.id; }); if (item) openModal(galleryModal(item)); }
  if (action === "logout") { sessionStorage.removeItem("visiona-token"); adminData = null; location.hash = "#/"; toast("Signed out."); }
  if (action === "admin-tab") { adminTab = target.dataset.tab; render(); }
  if (action === "review-status") updateReview(target.dataset.id, target.dataset.status);
  if (action === "delete-review") deleteReview(target.dataset.id);
  if (action === "toggle-featured") toggleFeatured(target.dataset.id);
  if (action === "delete-product") deleteProduct(target.dataset.id);
  if (action === "delete-gallery-item") deleteGalleryItem(target.dataset.id);
  if (action === "edit-product") { editingProductId = target.dataset.id; render(); const el = document.querySelector('[data-form="product"]'); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  if (action === "cancel-edit-product") { editingProductId = null; render(); }
  if (action === "add-hours-row") { openingHoursDraft = (openingHoursDraft || (adminData ? adminData.store.openingHours : []) || []).concat([["", ""]]); render(); }
  if (action === "remove-hours-row") { const base = openingHoursDraft || (adminData ? adminData.store.openingHours : []) || []; openingHoursDraft = base.filter(function (_, i) { return i !== Number(target.dataset.index); }); render(); }
  if (action === "toggle-service") toggleService(target.dataset.id);
});
document.addEventListener("change", function (event) {
  const item = event.target;
  if (item.dataset.action === "update-status") updateStatus(item.dataset.kind, item.dataset.id, item.value);
});
document.addEventListener("submit", function (event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const kind = form.dataset.form;
  if (["inquiry", "appointment", "review"].includes(kind)) submitCustomerForm(form);
  if (kind === "login") submitLogin(form);
  if (kind === "product") submitProduct(form);
  if (kind === "gallery") submitGallery(form);
  if (kind === "store") submitStore(form);
});
async function updateStatus(kind, id, status) {
  try { await api("/api/admin/" + kind + "/" + id, { method: "PATCH", body: JSON.stringify({ status: status }) }); await loadAdmin(); toast("Status updated."); }
  catch (error) { toast(error.message, true); }
}
async function updateReview(id, status) {
  try { await api("/api/admin/reviews/" + id, { method: "PATCH", body: JSON.stringify({ status: status }) }); await loadAdmin(); toast("Review " + status + "."); }
  catch (error) { toast(error.message, true); }
}
async function deleteReview(id) {
  if (!confirm("Delete this review permanently?")) return;
  try { await api("/api/admin/reviews/" + id, { method: "DELETE" }); await loadAdmin(); toast("Review deleted."); }
  catch (error) { toast(error.message, true); }
}
async function toggleFeatured(id) {
  const product = adminData ? adminData.products.find(function (item) { return item.id === id; }) : null;
  if (!product) return;
  try { await api("/api/admin/products/" + id, { method: "PATCH", body: JSON.stringify({ featured: !product.featured }) }); await loadAdmin(); toast("Product updated."); }
  catch (error) { toast(error.message, true); }
}
async function submitGallery(form) {
  if (!validateForm(form)) return;
  const button = form.querySelector("button[type=submit]");
  const originalLabel = button.textContent;
  button.disabled = true;
  try {
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[name="photo"]');
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;
    formData.delete("photo");
    const data = Object.fromEntries(formData);
    if (!file) { toast("Please choose a photo.", true); return; }
    button.textContent = "Uploading...";
    data.imageData = await resizeImage(file);
    await api("/api/admin/gallery", { method: "POST", body: JSON.stringify(data) });
    toast("Photo published.");
    await loadAdmin();
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}
async function deleteGalleryItem(id) {
  if (!confirm("Delete this photo permanently?")) return;
  try { await api("/api/admin/gallery/" + id, { method: "DELETE" }); await loadAdmin(); toast("Photo deleted."); }
  catch (error) { toast(error.message, true); }
}
async function deleteProduct(id) {
  if (!confirm("Delete this showcase frame permanently?")) return;
  try { await api("/api/admin/products/" + id, { method: "DELETE" }); if (editingProductId === id) editingProductId = null; await loadAdmin(); toast("Showcase frame deleted."); }
  catch (error) { toast(error.message, true); }
}
async function toggleService(id) {
  const service = adminData ? adminData.services.find(function (item) { return item.id === id; }) : null;
  if (!service) return;
  try { await api("/api/admin/services/" + id, { method: "PATCH", body: JSON.stringify({ enabled: !service.enabled }) }); await loadAdmin(); toast("Service visibility updated."); }
  catch (error) { toast(error.message, true); }
}
window.addEventListener("hashchange", function () { closeModal(); mobileOpen = false; render(); });
setSchema();
await loadRuntime();
render();
