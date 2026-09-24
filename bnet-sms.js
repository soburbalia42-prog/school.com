// /api/bnet-sms.js
// Vercel সার্ভারলেস ফাংশন — BNET SMS API-কে সার্ভার সাইড থেকে কল করে।
// ব্রাউজার এই ফাংশনকেই কল করবে (একই ডোমেইন, তাই CORS সমস্যা হয় না),
// আর এই ফাংশনটা সার্ভার থেকে BNET-কে কল করে (সার্ভার-টু-সার্ভার কলে CORS প্রযোজ্য না)।

module.exports = async function handler(req, res) {
    // শুধু GET অনুমোদন
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ ok: false, error: 'শুধুমাত্র GET মেথড সমর্থিত' });
    }

    try {
        // ফ্রন্টএন্ড থেকে আসা সব query parameter (api_key, type, contacts, senderid, msg)
        // হুবহু BNET-এর URL-এ ফরওয়ার্ড করা হচ্ছে।
        const qs = new URLSearchParams(req.query).toString();

        if (!qs) {
            return res.status(400).json({ ok: false, error: 'কোনো parameter পাওয়া যায়নি' });
        }

        const targetUrl = `https://api.bnet.com.bd/smsapi2?${qs}`;

        const bnetResponse = await fetch(targetUrl, { method: 'GET' });
        const bodyText = await bnetResponse.text();

        // BNET যা রেসপন্স দিয়েছে তার status code ও body ফেরত পাঠানো হচ্ছে
        res.status(200).json({
            ok: bnetResponse.ok,
            bnetStatus: bnetResponse.status,
            body: bodyText
        });
    } catch (error) {
        console.error('BNET প্রক্সি ত্রুটি:', error);
        res.status(502).json({ ok: false, error: 'BNET সার্ভারে পৌঁছানো যায়নি: ' + error.message });
    }
};
