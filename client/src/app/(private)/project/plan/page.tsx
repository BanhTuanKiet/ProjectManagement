"use client"

import PricingTable from "@/components/pricing-table"

export default function Page() {
    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <PricingTable />

            <div className="text-center mt-12">
                <p className="text-muted-foreground text-sm">
                    All plans include secure cloud hosting, regular updates, and daily backups.
                    <br />
                    Cancel anytime. No hidden fees.
                </p>
            </div>
        </div>
    )
}
