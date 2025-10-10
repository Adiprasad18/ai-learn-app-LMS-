"use client";

import Image from 'next/image'
import React from 'react'
import { Sparkles, CheckCircle } from 'lucide-react'

function WelcomeBanner({ user, success }) {
    return (
        <div className="relative overflow-hidden bg-primary dark:bg-primary rounded-xl p-8 shadow-sm animate-fade-in-up">
            <div className="relative flex items-center gap-6">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center">
                        <Image src='/laptop.png' alt='laptop' width={40} height={40} className="rounded-lg" />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {success ? (
                            <CheckCircle className="h-5 w-5 text-white dark:text-white" />
                        ) : (
                            <Sparkles className="h-5 w-5 text-white dark:text-white" />
                        )}
                        <h2 className='font-bold text-2xl text-white dark:text-white'>Hello, {user?.name || 'User'}</h2>
                    </div>
                    <p className="text-white/90 dark:text-white/90 text-base leading-relaxed">
                        {success ? 'Welcome! Your account has been created successfully.' : 'Welcome back! It\'s time to get started and learn new courses.'}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default WelcomeBanner
