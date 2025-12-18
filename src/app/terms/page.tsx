"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-4 bg-background font-body">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Nature Navigator Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-luxury mb-4 text-accent">
            Terms & Conditions
          </h1>
          <p className="text-lg text-accent font-medium">
            Nature Navigator Shuttle Services Ltd.
          </p>
        </div>

        <Card className="bg-card/50">
          <CardContent className="p-8 space-y-8">
            <p className="text-muted-foreground italic">
              All rates are in Canadian Dollars (CAD).
            </p>

            <Separator />

            {/* Services Offered */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Services Offered</CardTitle>
              <p className="text-foreground/80">
                Nature Navigator Shuttle Services Ltd. provides wedding transportation services only, using SUVs and Vans.
              </p>
            </section>

            <Separator />

            {/* Deposit & Payment Policy */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Deposit & Payment Policy (Weddings Only)</CardTitle>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>A 30% non-refundable deposit is required at the time of booking to secure the reservation.</li>
                <li>The remaining balance is due two (2) months prior to the event date.</li>
                <li>Once the remaining balance is charged, it is non-refundable.</li>
                <li>If cancellation occurs more than two (2) months before the event date, only the deposit will be retained and the remaining balance will not be charged.</li>
              </ul>
            </section>

            <Separator />

            {/* Cancellation Policy */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Cancellation Policy</CardTitle>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>All deposits are non-refundable under all circumstances.</li>
                <li>Any payments made within two (2) months of the event date are non-refundable.</li>
              </ul>
            </section>

            <Separator />

            {/* No-Show Policy */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">No-Show Policy</CardTitle>
              <p className="text-foreground/80">
                Failure to appear at the scheduled pickup time and location will be considered a no-show, and full charges will apply, with no exceptions.
              </p>
            </section>

            <Separator />

            {/* Booking Amendments */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Booking Amendments</CardTitle>
              <p className="text-foreground/80">
                For complimentary booking changes, please email{" "}
                <a href="mailto:info@naturenavigatorshuttle.ca" className="text-accent hover:underline">
                  info@naturenavigatorshuttle.ca
                </a>{" "}
                at least 24 hours in advance or call{" "}
                <a href="tel:+14379904858" className="text-accent hover:underline">
                  +1 (437) 990-4858
                </a>{" "}
                at least 8 hours prior to pickup, subject to availability.
              </p>
            </section>

            <Separator />

            {/* Additional Stops */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Additional Stops</CardTitle>
              <p className="text-foreground/80">
                Any additional stops beyond the agreed itinerary will be charged a minimum of 30 minutes at the vehicle's hourly rate per stop, excluding brief washroom breaks.
              </p>
            </section>

            <Separator />

            {/* Waiting Time */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Waiting Time</CardTitle>
              <p className="text-foreground/80">
                No charge for the first 15 minutes from the scheduled pickup time. After that, waiting time may be charged at the vehicle's hourly rate.
              </p>
            </section>

            <Separator />

            {/* Vehicle Changes */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Vehicle Changes</CardTitle>
              <p className="text-foreground/80">
                Vehicle type cannot be downgraded within 72 hours of the scheduled service date.
              </p>
            </section>

            <Separator />

            {/* Vehicle Condition & Cleaning Fees */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Vehicle Condition & Cleaning Fees</CardTitle>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>A cleaning fee may apply if the vehicle is left in poor condition.</li>
                <li>Bodily fluid cleanup will result in a charge ranging from $300 to $1,000, depending on severity, to cover cleaning and vehicle downtime. No exceptions.</li>
              </ul>
            </section>

            <Separator />

            {/* Smoking & Vaping */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Smoking & Vaping</CardTitle>
              <p className="text-foreground/80">
                Smoking or vaping is strictly prohibited inside all vehicles. A $1,000 violation fee may apply, and services may be terminated immediately without refund.
              </p>
            </section>

            <Separator />

            {/* Service Interruptions */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Service Interruptions</CardTitle>
              <p className="text-foreground/80">
                Nature Navigator Shuttle Services Ltd. is not liable for delays or service interruptions caused by mechanical issues, unsafe road conditions, weather events, road closures, accidents, or other circumstances beyond our control.
              </p>
            </section>

            <Separator />

            {/* Termination of Service */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Termination of Service</CardTitle>
              <p className="text-foreground/80">
                Chauffeurs reserve the right to terminate services without refund in cases of unsafe, illegal, or inappropriate behavior by any passenger.
              </p>
            </section>

            <Separator />

            {/* Lost Items */}
            <section>
              <CardTitle className="text-xl font-luxury mb-3">Lost Items</CardTitle>
              <p className="text-foreground/80">
                Nature Navigator Shuttle Services Ltd. is not responsible for personal items left behind in the vehicles.
              </p>
            </section>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
