
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileSpreadsheet, HeartPulse, Brain } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface HealthResourceContent {
  slug: string;
  title: string;
  icon: LucideIcon;
  fullDescription: string;
  details: React.ReactNode;
}

const healthResourcesData: HealthResourceContent[] = [
  {
    slug: "understanding-lab-results",
    title: "Understanding Your Lab Results",
    icon: FileSpreadsheet,
    fullDescription: "A guide to help you interpret common lab test results and understand their implications for your health.",
    details: (
      <div className="space-y-4">
        <p>Lab results can sometimes be confusing. Here's a breakdown of some common tests:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Complete Blood Count (CBC):</strong> This test measures different components of your blood, including red blood cells (oxygen transport), white blood cells (immune function), and platelets (clotting). Abnormal levels can indicate infection, anemia, or other conditions.</li>
          <li><strong>Lipid Panel:</strong> Measures cholesterol and triglycerides. Key components include LDL (bad cholesterol), HDL (good cholesterol), and total cholesterol. High LDL or total cholesterol can increase your risk of heart disease.</li>
          <li><strong>Basic Metabolic Panel (BMP):</strong> Checks levels of glucose, calcium, electrolytes (like sodium and potassium), and kidney function markers (like BUN and creatinine).</li>
          <li><strong>Thyroid Stimulating Hormone (TSH):</strong> Evaluates thyroid gland function. High TSH can indicate an underactive thyroid (hypothyroidism), while low TSH can suggest an overactive thyroid (hyperthyroidism).</li>
        </ul>
        <p>It's important to discuss your specific results with your doctor. They can interpret them in the context of your overall health, medical history, and lifestyle. Don't hesitate to ask questions if something is unclear.</p>
      </div>
    )
  },
  {
    slug: "tips-for-healthy-heart",
    title: "Tips for a Healthy Heart",
    icon: HeartPulse,
    fullDescription: "Discover actionable lifestyle changes and dietary advice for better cardiovascular health and a stronger heart.",
    details: (
      <div className="space-y-4">
        <p>Maintaining a healthy heart is crucial for overall well-being. Here are some effective strategies:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Eat a Balanced Diet:</strong> Focus on fruits, vegetables, whole grains, lean proteins (like fish and poultry), and healthy fats (like those found in avocados and nuts). Limit processed foods, sugary drinks, and excessive saturated and trans fats.</li>
          <li><strong>Stay Physically Active:</strong> Aim for at least 150 minutes of moderate-intensity aerobic exercise (like brisk walking or cycling) or 75 minutes of vigorous-intensity exercise per week, plus muscle-strengthening activities twice a week.</li>
          <li><strong>Maintain a Healthy Weight:</strong> Being overweight or obese can strain your heart. Even modest weight loss can make a big difference.</li>
          <li><strong>Don't Smoke:</strong> Smoking is a major risk factor for heart disease. If you smoke, seek help to quit.</li>
          <li><strong>Manage Stress:</strong> Chronic stress can contribute to heart problems. Practice stress-reducing techniques like meditation, yoga, deep breathing, or spending time in nature.</li>
          <li><strong>Get Enough Sleep:</strong> Aim for 7-9 hours of quality sleep per night. Poor sleep can negatively impact heart health.</li>
          <li><strong>Regular Check-ups:</strong> Visit your doctor regularly for blood pressure, cholesterol, and diabetes screenings.</li>
        </ul>
      </div>
    )
  },
  {
    slug: "managing-stress-for-wellness",
    title: "Managing Stress for Better Wellness",
    icon: Brain,
    fullDescription: "Explore effective techniques for stress reduction and improving your mental and physical well-being.",
    details: (
      <div className="space-y-4">
        <p>Stress is a normal part of life, but chronic stress can take a toll on your health. Learning to manage it effectively is key to overall wellness.</p>
        <h3 className="font-semibold text-lg mt-3">Effective Stress Management Techniques:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Mindfulness and Meditation:</strong> Practicing mindfulness can help you stay present and reduce anxiety. Even a few minutes of daily meditation can make a difference.</li>
          <li><strong>Regular Physical Activity:</strong> Exercise is a powerful stress reliever. It releases endorphins, which improve mood and reduce stress.</li>
          <li><strong>Adequate Sleep:</strong> Lack of sleep can exacerbate stress. Aim for 7-9 hours of quality sleep each night. Establish a regular sleep schedule.</li>
          <li><strong>Healthy Diet:</strong> A balanced diet can help stabilize your mood and energy levels. Avoid excessive caffeine and sugar, which can worsen stress symptoms.</li>
          <li><strong>Time Management:</strong> Feeling overwhelmed by tasks can increase stress. Prioritize your tasks, break large projects into smaller steps, and learn to say no to commitments you can't handle.</li>
          <li><strong>Social Support:</strong> Connect with friends, family, or support groups. Talking about your stressors can help.</li>
          <li><strong>Hobbies and Relaxation:</strong> Make time for activities you enjoy and that help you relax, such as reading, listening to music, gardening, or spending time in nature.</li>
          <li><strong>Deep Breathing Exercises:</strong> Simple breathing exercises can help calm your nervous system quickly.</li>
          <li><strong>Limit News and Social Media:</strong> Constant exposure to negative news or social media comparisons can increase stress. Set boundaries for consumption.</li>
          <li><strong>Seek Professional Help:</strong> If stress feels overwhelming and unmanageable, don't hesitate to talk to a therapist or counselor.</li>
        </ul>
        <p>Remember, managing stress is an ongoing process. Find what works best for you and make it a regular part of your routine.</p>
      </div>
    )
  }
];

export default function HealthResourcePage() {
  const params = useParams();
  const slug = params.slug as string;

  const resource = healthResourcesData.find(r => r.slug === slug);

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Resource Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              The health resource you're looking for could not be found.
            </p>
            <Button asChild variant="outline">
              <Link href="/patient/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = resource.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link href="/patient/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center mb-3">
            <IconComponent className="h-8 w-8 mr-3 text-primary flex-shrink-0" />
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">{resource.title}</CardTitle>
          </div>
          <CardDescription className="text-lg text-muted-foreground">{resource.fullDescription}</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-foreground text-base leading-relaxed">
          {/* 
            Using 'prose' class from @tailwindcss/typography for nice default article styling.
            Ensure @tailwindcss/typography is installed or adjust styling manually.
            If not installed, remove 'prose dark:prose-invert' and style manually.
          */}
          {resource.details}
        </CardContent>
      </Card>
    </div>
  );
}

    