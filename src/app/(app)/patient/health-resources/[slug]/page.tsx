
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileSpreadsheet, HeartPulse, Brain, Calculator, Percent, Scale } from 'lucide-react'; // Added Calculator, Percent, Scale
import type { LucideIcon } from 'lucide-react';

interface HealthResourceContent {
  slug: string;
  title: string;
  icon: LucideIcon;
  fullDescription: string;
  details: React.ReactNode;
  isTool?: boolean; // To differentiate informational content from tools
}

const BmiCalculator: React.FC = () => {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ftin'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiInterpretation, setBmiInterpretation] = useState<string>('');

  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');

  const calculateBmi = () => {
    let heightInMeters: number;
    let weightInKg: number;

    if (heightUnit === 'cm') {
      if (!height || parseFloat(height) <= 0) {
        setBmiInterpretation("Please enter a valid height.");
        setBmiResult(null);
        return;
      }
      heightInMeters = parseFloat(height) / 100;
    } else { // ftin
      const ft = parseFloat(feet);
      const inc = parseFloat(inches);
      if (isNaN(ft) || ft < 0 || isNaN(inc) || inc < 0 || inc >= 12) {
         setBmiInterpretation("Please enter valid feet and inches.");
         setBmiResult(null);
         return;
      }
      heightInMeters = (ft * 12 + inc) * 0.0254;
    }

    if (weightUnit === 'kg') {
      if (!weight || parseFloat(weight) <= 0) {
        setBmiInterpretation("Please enter a valid weight.");
        setBmiResult(null);
        return;
      }
      weightInKg = parseFloat(weight);
    } else { // lbs
      if (!weight || parseFloat(weight) <= 0) {
        setBmiInterpretation("Please enter a valid weight.");
        setBmiResult(null);
        return;
      }
      weightInKg = parseFloat(weight) * 0.453592;
    }

    if (heightInMeters > 0 && weightInKg > 0) {
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      setBmiResult(parseFloat(bmi.toFixed(1)));

      if (bmi < 18.5) setBmiInterpretation('Underweight');
      else if (bmi < 25) setBmiInterpretation('Normal weight');
      else if (bmi < 30) setBmiInterpretation('Overweight');
      else setBmiInterpretation('Obesity');
    } else {
      setBmiResult(null);
      setBmiInterpretation('Please enter valid height and weight values.');
    }
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Height Input */}
        <div className="space-y-2">
          <Label htmlFor="height-unit">Height Unit</Label>
          <Select value={heightUnit} onValueChange={(value) => setHeightUnit(value as 'cm' | 'ftin')}>
            <SelectTrigger id="height-unit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">Centimeters (cm)</SelectItem>
              <SelectItem value="ftin">Feet & Inches (ft/in)</SelectItem>
            </SelectContent>
          </Select>
          {heightUnit === 'cm' && (
            <Input
              id="heightCm"
              type="number"
              placeholder="e.g., 170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1"
            />
          )}
          {heightUnit === 'ftin' && (
            <div className="flex gap-2 mt-1">
              <Input
                id="heightFt"
                type="number"
                placeholder="Feet"
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
              />
              <Input
                id="heightIn"
                type="number"
                placeholder="Inches"
                value={inches}
                onChange={(e) => setInches(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="weight-unit">Weight Unit</Label>
          <Select value={weightUnit} onValueChange={(value) => setWeightUnit(value as 'kg' | 'lbs')}>
            <SelectTrigger id="weight-unit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="lbs">Pounds (lbs)</SelectItem>
            </SelectContent>
          </Select>
          <Input
            id="weight"
            type="number"
            placeholder={weightUnit === 'kg' ? "e.g., 65" : "e.g., 150"}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Button onClick={calculateBmi} className="w-full sm:w-auto">
        <Calculator className="mr-2 h-4 w-4" /> Calculate BMI
      </Button>

      {bmiResult !== null && (
        <Card className="mt-6 p-4 bg-muted/50">
          <CardTitle className="text-lg mb-2">Your BMI Result</CardTitle>
          <p className="text-3xl font-bold text-primary">{bmiResult}</p>
          <p className="text-md text-muted-foreground mt-1">Interpretation: <span className="font-semibold text-foreground">{bmiInterpretation}</span></p>
          <CardDescription className="text-xs mt-3">
            Note: BMI is a general indicator and may not be accurate for all body types (e.g., athletes). Consult a healthcare professional for a comprehensive assessment.
          </CardDescription>
        </Card>
      )}
      {bmiResult === null && bmiInterpretation && (
         <p className="text-sm text-destructive mt-2">{bmiInterpretation}</p>
      )}
    </div>
  );
};


const healthResourcesData: HealthResourceContent[] = [
  {
    slug: "bmi-calculator",
    title: "BMI Calculator",
    icon: Calculator,
    isTool: true,
    fullDescription: "Calculate your Body Mass Index (BMI) using your height and weight. BMI is a widely used screening tool to categorize weight status.",
    details: <BmiCalculator />
  },
  {
    slug: "understanding-body-fat",
    title: "Understanding Body Fat Percentage",
    icon: Percent,
    fullDescription: "Learn about body fat percentage, its importance for health, typical ranges, and common measurement methods.",
    details: (
      <div className="space-y-4">
        <p>Body fat percentage is the proportion of fat your body has compared to other tissues like muscle, bone, and water. It's a more accurate indicator of health than weight alone.</p>
        <h3 className="font-semibold text-lg mt-3">Why is it Important?</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Health Risks:</strong> Excess body fat, particularly visceral fat (around organs), is linked to increased risk of heart disease, type 2 diabetes, high blood pressure, and certain cancers.</li>
          <li><strong>Energy Storage:</strong> Fat is essential for storing energy, insulating the body, and protecting organs.</li>
          <li><strong>Hormone Regulation:</strong> Body fat plays a role in producing and regulating hormones.</li>
        </ul>
        <h3 className="font-semibold text-lg mt-3">General Healthy Ranges:</h3>
        <p className="text-sm text-muted-foreground">(These are general guidelines and can vary based on age, sex, and individual factors. Consult a healthcare provider for personalized advice.)</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Men:</strong> Essential fat ~2-5%. Athletes ~6-13%. Fitness ~14-17%. Acceptable ~18-24%. Obesity {'>'}25%.</li>
          <li><strong>Women:</strong> Essential fat ~10-13%. Athletes ~14-20%. Fitness ~21-24%. Acceptable ~25-31%. Obesity {'>'}32%.</li>
        </ul>
        <h3 className="font-semibold text-lg mt-3">Common Measurement Methods:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Skinfold Calipers:</strong> Measures thickness of subcutaneous fat at specific sites.</li>
          <li><strong>Bioelectrical Impedance Analysis (BIA):</strong> Sends a small electrical current through the body. Many home scales use this.</li>
          <li><strong>Dual-Energy X-ray Absorptiometry (DXA/DEXA):</strong> Considered a gold standard, uses X-rays to measure bone density, lean mass, and fat mass.</li>
          <li><strong>Hydrostatic Weighing (Underwater Weighing):</strong> Measures body density by submerging a person in water.</li>
          <li><strong>Air Displacement Plethysmography (Bod Pod):</strong> Similar to underwater weighing but uses air displacement.</li>
        </ul>
        <p>Online calculators for body fat percentage exist, but their accuracy varies greatly as they often rely on limited inputs (like BMI, age, gender) and estimations. For precise measurements, consult with a healthcare or fitness professional.</p>
      </div>
    )
  },
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
              The health resource or tool you're looking for could not be found.
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
      <Button asChild variant="outline" size="sm" className="mb-4 group transition-all duration-300 hover:border-primary hover:text-primary active:scale-95">
        <Link href="/patient/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
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
        <CardContent className={resource.isTool ? "" : "prose dark:prose-invert max-w-none text-foreground text-base leading-relaxed"}>
          {resource.details}
        </CardContent>
      </Card>
    </div>
  );
}
