import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw"; // Renders HTML inside markdown
import remarkGfm from "remark-gfm"; // Handles GitHub Flavored Markdown (tables, etc.)
import logo from '../logo.png';

// Then use <img src={logo} ... />


// UI Components & Icons
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Bookmark, Calendar, Check, DollarSign, Download, Heart, MapPin, Printer, RotateCcw, Share2, Zap } from "lucide-react";

// API Request Function (assuming it exists)
import { apiRequest } from "@/lib/queryClient";

// Type Definitions
interface ItineraryFormData {
  destination: string;
  duration: number;
  budget: "Budget-friendly" | "Moderate" | "Luxury";
  interests: string;
}

interface GenerateItineraryResponse {
  itinerary: string; // Expecting a markdown string
}

// --- Sub-components for a Cleaner Structure ---

const HeroSection = () => (
  <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16 mb-8">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
        <img
          src="/logo.png"
          alt="App Logo"
          className="w-12 h-12 object-contain"
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4">MakeMyPlan</h1>
      <p className="text-xl text-blue-100 max-w-2xl mx-auto">
        Your next adventure, personalized in seconds. Let our AI create the perfect travel plan for you.
      </p>
    </div>
  </div>
);

const ItineraryForm = ({
  formData,
  onFormChange,
  onSubmit,
  isLoading,
}: {
  formData: ItineraryFormData;
  onFormChange: (field: keyof ItineraryFormData, value: string | number) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}) => (
  <Card className="p-8 mb-8">
    <CardContent className="p-0">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-header">Plan Your Journey</h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="destination" className="flex items-center text-sm font-medium text-text mb-2"><MapPin className="w-4 h-4 mr-2" />Destination</Label>
            <Input id="destination" type="text" placeholder="e.g., Shillong, India" value={formData.destination} onChange={(e) => onFormChange("destination", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="duration" className="flex items-center text-sm font-medium text-text mb-2"><Calendar className="w-4 h-4 mr-2" />Trip Duration (days)</Label>
            <Input id="duration" type="number" min="1" max="30" value={formData.duration} onChange={(e) => onFormChange("duration", parseInt(e.target.value) || 1)} required />
          </div>
          <div>
            <Label htmlFor="budget" className="flex items-center text-sm font-medium text-text mb-2"><DollarSign className="w-4 h-4 mr-2" />Budget Style</Label>
            <Select value={formData.budget} onValueChange={(value: ItineraryFormData['budget']) => onFormChange("budget", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Budget-friendly">Budget-friendly</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="interests" className="flex items-center text-sm font-medium text-text mb-2"><Heart className="w-4 h-4 mr-2" />Interests & Preferences</Label>
            <Input id="interests" type="text" placeholder="e.g., Local Food, Nature, History, Photography" value={formData.interests} onChange={(e) => onFormChange("interests", e.target.value)} required />
          </div>
        </div>
        <Button type="submit" className="w-full font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]" disabled={isLoading}>
          {isLoading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Generating...</>
          ) : (
            <><Zap className="w-5 h-5 mr-2" />Create My Itinerary</>
          )}
        </Button>
      </form>
    </CardContent>
  </Card>
);

const LoadingState = () => (
  <Card className="p-8 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    <h3 className="text-xl font-semibold text-header mb-2">Crafting Your Perfect Itinerary...</h3>
    <p className="text-text-light">Our AI is analyzing your preferences to create a personalized travel plan.</p>
  </Card>
);

const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void; }) => (
  <Card className="bg-red-50 border border-red-200 p-6">
    <div className="flex">
      <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
      <div>
        <h3 className="font-semibold text-red-800">Unable to Generate Itinerary</h3>
        <p className="mt-1 text-sm text-red-700">{error?.message || "An unexpected error occurred. Please try again."}</p>
        <Button size="sm" variant="outline" className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 border-red-300" onClick={onRetry}>Try Again</Button>
      </div>
    </div>
  </Card>
);

const ItineraryResult = ({
  destination,
  itineraryMarkdown,
  onReset,
}: {
  destination: string;
  itineraryMarkdown: string;
  onReset: () => void;
}) => (
  <Card className="p-8">
    <CardContent className="p-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <Check className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-header">Your Custom Itinerary for {destination}</h2>
        </div>
        <div className="flex space-x-1">
          <Button size="icon" variant="ghost" title="Save"><Bookmark className="w-5 h-5" /></Button>
          <Button size="icon" variant="ghost" title="Share"><Share2 className="w-5 h-5" /></Button>
          <Button size="icon" variant="ghost" title="Print" onClick={() => window.print()}><Printer className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* Markdown Renderer */}
      <div className="prose max-w-none prose-sm sm:prose-base text-gray-700 prose-headings:font-bold prose-h3:mt-6 prose-hr:my-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {itineraryMarkdown}
        </ReactMarkdown>
      </div>

      <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 font-semibold"><Download className="w-5 h-5 mr-2" />Download PDF</Button>
        <Button variant="outline" className="flex-1 font-semibold border-2" onClick={onReset}><RotateCcw className="w-5 h-5 mr-2" />Generate New Plan</Button>
      </div>
    </CardContent>
  </Card>
);

const PageFooter = () => (
  <footer className="bg-white border-t py-8 mt-16 text-center">
    <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
    <p className="font-semibold text-header">Smart Itinerary Planner</p>
    <p className="text-text-light text-sm mt-1">Powered by Google Gemini AI • Made for travelers</p>
  </footer>
);


// --- Main Page Component ---

export default function Home() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ItineraryFormData>({
    destination: "",
    duration: 7,
    budget: "Moderate",
    interests: "",
  });
  const [generatedItinerary, setGeneratedItinerary] = useState<string>("");

  const itineraryMutation = useMutation({
    mutationFn: (data: ItineraryFormData): Promise<GenerateItineraryResponse> => apiRequest("POST", "/api/generate-itinerary", data).then(res => res.json()),
    onSuccess: (data) => {
      // Example Markdown for testing. Replace with actual API response.
      const exampleMarkdown = `
### **Day 1: Arrival and Local Flavors**
* Arrive at Shillong (UMI) or Guwahati (GAU) airport and transfer to your hotel. **(Taxi: ₹1000-₹2000)**
* Lunch at **Arnica's Kitchen** for authentic Khasi cuisine. **(Budget: ₹500-₹800)**
* Evening stroll through **Police Bazaar**. Sample street food like *jadoh* or *putharo*. **(Budget: ₹200-₹300)**
<hr/>

### **Day 2: Exploring Shillong's Culinary Scene**
* Morning visit to a local market like **Iewduh (Bara Bazar)**.
* Lunch with stunning views at the popular **Cafe Shillong**. **(Budget: ₹600-₹1000)**
<hr/>

### **Day 3: Day Trip to Cherrapunji (Sohra)**
* Hire a taxi for a day trip to Cherrapunji. **(Full day taxi: ₹2500-₹3500)**
* Enjoy local specialties at a restaurant in Cherrapunji. **(Budget: ₹400-₹700)**
* Explore the **Seven Sister Falls** and other natural wonders.`;

      setGeneratedItinerary(data.itinerary || exampleMarkdown); // Use actual data, fallback to example
      toast({ title: "Itinerary Generated!", description: "Your personalized travel plan is ready." });
    },
    onError: (error: Error) => {
      toast({ title: "Generation Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    },
  });

  const handleFormChange = (field: keyof ItineraryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim() || !formData.interests.trim()) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setGeneratedItinerary(""); // Clear previous results before new submission
    itineraryMutation.mutate(formData);
  };

  const handleReset = () => {
    setGeneratedItinerary("");
    itineraryMutation.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />

      <main className="max-w-4xl mx-auto px-4 pb-16">
        {!generatedItinerary && !itineraryMutation.isPending && !itineraryMutation.isError && (
          <ItineraryForm
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleFormSubmit}
            isLoading={itineraryMutation.isPending}
          />
        )}

        {itineraryMutation.isPending && <LoadingState />}

        {itineraryMutation.isError && <ErrorState error={itineraryMutation.error} onRetry={handleReset} />}

        {generatedItinerary && (
          <ItineraryResult
            destination={formData.destination}
            itineraryMarkdown={generatedItinerary}
            onReset={handleReset}
          />
        )}
      </main>

      <PageFooter />
    </div>
  );
}
