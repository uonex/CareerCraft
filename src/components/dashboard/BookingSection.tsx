import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, User as UserIcon, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookingSectionProps {
  user: User;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
}

interface Counselor {
  id: string;
  name: string;
  specializations: string[];
  experience_years: number;
  bio: string;
  rate_per_session: number;
}

export const BookingSection = ({ user }: BookingSectionProps) => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState(1);
  
  const [bookingData, setBookingData] = useState({
    serviceType: "",
    counselorId: "",
    date: "",
    time: "",
    notes: "",
    educationLevel: "",
    phone: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [serviceTypesRes, counselorsRes] = await Promise.all([
        supabase.from("service_types").select("*").eq("is_active", true),
        supabase.from("counselors").select("*").eq("is_active", true)
      ]);

      if (serviceTypesRes.error) throw serviceTypesRes.error;
      if (counselorsRes.error) throw counselorsRes.error;

      setServiceTypes(serviceTypesRes.data || []);
      setCounselors(counselorsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load booking information");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    setBooking(true);
    try {
      const selectedService = serviceTypes.find(s => s.id === bookingData.serviceType);
      const selectedCounselor = counselors.find(c => c.id === bookingData.counselorId);
      
      if (!selectedService || !selectedCounselor) {
        throw new Error("Invalid service or counselor selection");
      }

      // Validate date is not in the past
      const selectedDate = new Date(bookingData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (selectedDate < today) {
        throw new Error("Please select a future date for your session");
      }

      // Ensure date is in YYYY-MM-DD format
      const formattedDate = bookingData.date;
      
      console.log("Booking data:", {
        date: formattedDate,
        time: bookingData.time,
        user_id: user.id,
        counselor_id: bookingData.counselorId
      });

      const { error } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          counselor_id: bookingData.counselorId,
          service_type: selectedService.name,
          session_date: formattedDate,
          session_time: bookingData.time,
          notes: bookingData.notes,
          rate: selectedCounselor.rate_per_session,
          status: 'booked',
          payment_status: 'pending'
        });

      if (error) throw error;

      toast.success("Session booked successfully! You'll receive a confirmation email shortly.");
      
      // Reset form
      setBookingData({
        serviceType: "",
        counselorId: "",
        date: "",
        time: "",
        notes: "",
        educationLevel: "",
        phone: ""
      });
      setStep(1);
      
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Error booking session: " + error.message);
    } finally {
      setBooking(false);
    }
  };

  const selectedService = serviceTypes.find(s => s.id === bookingData.serviceType);
  const selectedCounselor = counselors.find(c => c.id === bookingData.counselorId);

  if (loading) {
    return <div className="animate-pulse">Loading booking form...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Book New Session</h2>
        <p className="text-muted-foreground">
          Schedule your personalized offline counseling session
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Your Personalized Offline Session</CardTitle>
          <CardDescription>
            Select your preferred counselor, date, and time. All sessions are conducted at our office location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Choose Service */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <h3 className="font-medium">Choose Your Service</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceTypes.map((service) => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-colors ${
                    bookingData.serviceType === service.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, serviceType: service.id }))}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Duration: {service.duration_minutes} min</span>
                      <span className="font-medium text-sm">₹{service.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Step 2: Select Counselor */}
          {bookingData.serviceType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <h3 className="font-medium">Select Your Counselor</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {counselors.map((counselor) => (
                  <Card 
                    key={counselor.id}
                    className={`cursor-pointer transition-colors ${
                      bookingData.counselorId === counselor.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setBookingData(prev => ({ ...prev, counselorId: counselor.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-medium">{counselor.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {counselor.specializations.join(", ")} • {counselor.experience_years} years experience
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{counselor.bio}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">₹{counselor.rate_per_session}</span>
                          <p className="text-xs text-muted-foreground">per session</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pick Date & Time */}
          {bookingData.counselorId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground">
                  3
                </div>
                <h3 className="font-medium">Pick Date & Time</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Select Time</Label>
                  <Select 
                    value={bookingData.time} 
                    onValueChange={(value) => setBookingData(prev => ({ ...prev, time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {bookingData.date && bookingData.time && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground">
                  4
                </div>
                <h3 className="font-medium">Additional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select 
                    value={bookingData.educationLevel} 
                    onValueChange={(value) => setBookingData(prev => ({ ...prev, educationLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class-9">Class 9</SelectItem>
                      <SelectItem value="class-10">Class 10</SelectItem>
                      <SelectItem value="class-11">Class 11</SelectItem>
                      <SelectItem value="class-12">Class 12</SelectItem>
                      <SelectItem value="college-1">1st Year College</SelectItem>
                      <SelectItem value="college-2">2nd Year College</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">What are you looking for? (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Briefly describe your goals or specific areas you'd like guidance on..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {/* Booking Summary & Confirmation */}
          {selectedService && selectedCounselor && bookingData.date && bookingData.time && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span><strong>Service:</strong> {selectedService.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span><strong>Counselor:</strong> {selectedCounselor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Date:</strong> {bookingData.date ? new Date(bookingData.date + 'T00:00:00').toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span><strong>Time:</strong> {bookingData.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span><strong>Location:</strong> Career Craft Guidance Center</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span><strong>Rate:</strong> ₹{selectedCounselor.rate_per_session}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Important Details:</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Please arrive 10-15 minutes early</li>
                      <li>• Payment of ₹{selectedCounselor.rate_per_session} will be collected at the office</li>
                      <li>• Bring any academic reports or specific questions you wish to discuss</li>
                      <li>• A confirmation email/SMS will be sent to you</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={handleBooking} 
                  disabled={booking}
                  className="w-full"
                  size="lg"
                >
                  {booking ? "Confirming Booking..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};