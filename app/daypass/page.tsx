'use client'
import React from 'react'
import DayPassForm from '@/components/daypassform'

const DayPassPage = () => {
    return (
        <div className="min-h-screen gradient-bg py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Day Pass</h1>
                    <p className="text-muted-foreground text-lg">
                        Get a day pass for a flat fee.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        <DayPassForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayPassPage;
