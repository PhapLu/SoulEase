import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Resources.css'
import '../about/About.css'

const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

const ResourcesPage = () => {
    return (
        <div className='resources-page'>
            <section className='about-hero'>
                <div className='about-hero-inner'>
                    <p className='about-hero-eyebrow'>Frequently ask question</p>

                    <h1 className='about-hero-title'>
                        It is our pleasure to clear up any confusion
                        <br />
                        and provide you with the clarity you need.
                    </h1>

                    <p className='about-hero-description'>It is our pleasure to clear up any confusion and provide you with the clarity you need, ensuring that your experience with us remains smooth, simple, and fully supported.</p>

                    <button className='about-btn-primary'>Check out now</button>
                </div>
            </section>

            <div className='resources-layout'>
                {/* Sidebar */}
                <aside className='resources-sidebar'>
                    <p className='resources-sidebar-label'>QUICK ACCESS</p>
                    <ul className='resources-sidebar-list'>
                        <li onClick={() => scrollToSection('getting-started')}>Getting started questions</li>

                        <li onClick={() => scrollToSection('subscription')}>Subscription questions</li>

                        <li onClick={() => scrollToSection('security')}>Security questions</li>
                    </ul>
                </aside>

                {/* Main content */}
                <main className='resources-content'>
                    <h1 id='getting-started' className='resources-title'>
                        Getting started questions
                    </h1>

                    <section className='resources-item'>
                        <h2 className='resources-question'>What is SoulEase?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <section className='resources-item'>
                        <h2 className='resources-question'>Who is SoulEase made for?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <section className='resources-item'>
                        <h2 className='resources-question'>How do I sign up for SoulEase?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <section className='resources-item'>
                        <h2 className='resources-question'>How can I get support if I need it?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <h1 id='subscription' className='resources-title'>
                        Subscription questions
                    </h1>

                    <section className='resources-item'>
                        <h2 className='resources-question'>What payment methods do you accept for monthly subscription costs?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <section className='resources-item'>
                        <h2 className='resources-question'>Will the work I do during my trial be saved for me when I sign up for a paid subscription?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <section className='resources-item'>
                        <h2 className='resources-question'>What happens if I don’t sign up for a paid subscription after my free trial?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <section className='resources-item'>
                        <h2 className='resources-question'>How much does SoulEase cost, and are there any additional fees?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <h1 id='security' className='resources-title'>
                        Security questions
                    </h1>

                    <section className='resources-item'>
                        <h2 className='resources-question'>Can I export data from SoulEase?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>

                    <section className='resources-item'>
                        <h2 className='resources-question'>Is SoulEase HIPAA compliant?</h2>
                        <p className='resources-answer'>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</p>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default ResourcesPage
