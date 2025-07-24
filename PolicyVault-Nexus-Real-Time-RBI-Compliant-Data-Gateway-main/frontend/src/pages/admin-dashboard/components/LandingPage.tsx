// app/page.tsx

interface LandingPageProps {
    onSignIn: () => void;
}
export default function LandingPage({onSignIn} : LandingPageProps) {
    
    return (
        <main className="min-h-screen bg-white text-gray-900">
            {/* Hero Section */}
            <section className="px-6 py-20 text-center bg-indigo-50">
                <h1 className="text-4xl md:text-5xl font-bold text-indigo-700">
                    Take Control of Your Financial Data
                </h1>
                <p className="mt-4 max-w-xl mx-auto text-lg text-gray-700">
                    PolicyVault helps you manage, monitor, and securely share financial data with consent-based access.
                </p>
                <div className="mt-8">
                    <a
                        href="/dashboard"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                        onClick={onSignIn}
                    >
                        Get Started
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-6 bg-white">
                <h2 className="text-3xl font-bold text-center mb-12">Why PolicyVault?</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            title: 'Consent-Based Access',
                            desc: 'You decide who accesses your financial data and for how long.',
                        },
                        {
                            title: 'Track Everything',
                            desc: 'Audit logs show exactly when and how your data is accessed.',
                        },
                        {
                            title: 'Revoke Anytime',
                            desc: 'Stop data sharing instantly with one click.',
                        },
                    ].map((feature) => (
                        <div key={feature.title} className="p-6 border rounded-xl hover:shadow-md transition">
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials (Optional) */}
            <section className="py-12 bg-indigo-50 text-center">
                <h2 className="text-2xl font-bold mb-6">Trusted by Finance-Savvy Users</h2>
                <p className="text-gray-600 italic">“Finally, a tool that puts *me* in control of my data.”</p>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 bg-gray-900 text-white text-center">
                <p>© 2025 PolicyVault. All rights reserved.</p>
            </footer>
        </main>
    );
}
