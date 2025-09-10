import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Heart, 
  Target, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Share2,
  QrCode,
  Smartphone,
  CreditCard,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { fallbackDatabase as mongoDatabase } from '../lib/fallbackDatabase';
import { type Fundraiser } from '../lib/database';

interface FundraisersPageProps {
  user: any;
}

export function FundraisersPage({ user }: FundraisersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [donationAmounts, setDonationAmounts] = useState<{[key: string]: number}>({});
  const [selectedFundraiser, setSelectedFundraiser] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [newFundraiser, setNewFundraiser] = useState({
    title: '',
    description: '',
    goal: '',
    category: '',
    endDate: ''
  });

  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [completedFundraisers, setCompletedFundraisers] = useState<Fundraiser[]>([]);

  useEffect(() => {
    // Fetch fundraisers and completed fundraisers from the database
    const fetchFundraisers = async () => {
      const activeFundraisers = await mongoDatabase.getFundraisers();
      const completedFunds = await mongoDatabase.getCompletedFundraisers();
      setFundraisers(activeFundraisers);
      setCompletedFundraisers(completedFunds);
    };
    fetchFundraisers();
  }, []);

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredFundraisers = fundraisers.filter(fundraiser =>
    fundraiser.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fundraiser.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDonate = (fundraiserId: string, amount: number) => {
    const fundraiser = fundraisers.find(f => f.id === fundraiserId);
    if (fundraiser && amount > 0) {
      setSelectedFundraiser(fundraiser);
      setDonationAmounts({...donationAmounts, [fundraiserId]: amount});
    }
  };

  const handleCreateFundraiser = async () => {
    try {
      if (!newFundraiser.title || !newFundraiser.goal || !newFundraiser.description) {
        alert('Please fill in all required fields');
        return;
      }

      await mongoDatabase.createFundraiser({
        title: newFundraiser.title,
        description: newFundraiser.description,
        goal: parseInt(newFundraiser.goal),
        category: newFundraiser.category,
        endDate: newFundraiser.endDate,
        status: 'active',
        createdBy: user.id,
        image: 'bg-gradient-to-r from-blue-500 to-cyan-600'
      });

      // Refresh fundraisers list
      const updatedFundraisers = await mongoDatabase.getFundraisers();
      setFundraisers(updatedFundraisers);

      setNewFundraiser({
        title: '',
        description: '',
        goal: '',
        category: '',
        endDate: ''
      });

      alert('Fundraiser created successfully!');
    } catch (error) {
      console.error('Failed to create fundraiser:', error);
      alert('Failed to create fundraiser. Please try again.');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const generateUPILink = (amount: number, fundraiserTitle: string) => {
    const upiId = 'university@paytm'; // Example UPI ID
    const note = `Donation for ${fundraiserTitle}`;
    return `upi://pay?pa=${upiId}&am=${amount}&cu=USD&tn=${encodeURIComponent(note)}`;
  };

  const generateQRData = (amount: number, fundraiserTitle: string) => {
    return generateUPILink(amount, fundraiserTitle);
  };

  const PaymentDialog = () => {
    if (!selectedFundraiser) return null;
    
    const amount = donationAmounts[selectedFundraiser.id] || 0;
    const upiLink = generateUPILink(amount, selectedFundraiser.title);
    const qrData = generateQRData(amount, selectedFundraiser.title);

    return (
      <Dialog open={!!selectedFundraiser} onOpenChange={() => setSelectedFundraiser(null)}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Donate to {selectedFundraiser.title}</DialogTitle>
            <DialogDescription>
              Choose your preferred payment method to complete your donation of ${amount}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="upi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upi" className="flex items-center">
                <Smartphone className="w-4 h-4 mr-1" />
                UPI
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center">
                <QrCode className="w-4 h-4 mr-1" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                Card
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upi" className="space-y-4">
              <div className="text-center">
                <h3 className="text-gray-900 mb-4">Pay with UPI Apps</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { name: 'Google Pay', color: 'bg-blue-500', link: `tez://upi/pay?pa=university@paytm&am=${amount}&tn=Donation` },
                    { name: 'PhonePe', color: 'bg-purple-600', link: `phonepe://pay?pa=university@paytm&am=${amount}&tn=Donation` },
                    { name: 'Paytm', color: 'bg-indigo-600', link: `paytmmp://pay?pa=university@paytm&am=${amount}&tn=Donation` },
                    { name: 'BHIM', color: 'bg-green-600', link: `bhim://pay?pa=university@paytm&am=${amount}&tn=Donation` }
                  ].map((app) => (
                    <Button
                      key={app.name}
                      variant="outline"
                      className={`h-16 rounded-lg border-2 hover:${app.color} hover:text-white transition-all`}
                      onClick={() => window.open(app.link, '_blank')}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 ${app.color} rounded-full mx-auto mb-1`}></div>
                        <span className="text-sm">{app.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <Label>Or copy UPI ID:</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value="university@paytm" 
                      readOnly 
                      className="rounded-lg" 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('university@paytm', 'upi')}
                      className="rounded-lg"
                    >
                      {copiedText === 'upi' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Copy this UPI ID and use it in any UPI app to make your donation
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center">
                <h3 className="text-gray-900 mb-4">Scan QR Code</h3>
                
                {/* Mock QR Code - In a real app, you'd use a QR code library */}
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Scan this QR code with any UPI app to pay ${amount}
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Payment Details:</p>
                    <div className="text-left space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Amount:</span>
                        <span className="text-sm font-medium">${amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">To:</span>
                        <span className="text-sm font-medium">University Alumni Fund</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Note:</span>
                        <span className="text-sm font-medium">Donation for {selectedFundraiser.title}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(qrData, 'qr')}
                    className="rounded-lg"
                  >
                    {copiedText === 'qr' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Payment Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-gray-900">Credit/Debit Card Payment</h3>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    // Simulate card payment processing
                    const donation = await mongoDatabase.createDonation({
                      fundraiserId: selectedFundraiser.id,
                      userId: user.id,
                      amount: amount,
                      paymentMethod: 'card',
                      transactionId: `TXN_${Date.now()}`,
                      status: 'completed'
                    });
                    
                    // Update local state to reflect the donation
                    const updatedFundraisers = await mongoDatabase.getFundraisers();
                    setFundraisers(updatedFundraisers);
                    
                    // Close dialog and show success
                    setSelectedFundraiser(null);
                    alert(`Payment successful! Transaction ID: ${donation.transactionId}`);
                  } catch (error) {
                    console.error('Payment failed:', error);
                    alert('Payment failed. Please try again.');
                  }
                }} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="rounded-lg"
                      required
                      pattern="[0-9\s]{13,19}"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="rounded-lg"
                        required
                        pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        className="rounded-lg"
                        required
                        pattern="[0-9]{3,4}"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="rounded-lg"
                      required
                    />
                  </div>
                
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-gray-900">${amount}</span>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full rounded-lg bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ${amount}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Your payment is secured with 256-bit SSL encryption
                  </p>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }; 

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentDialog />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-gray-900">Alumni Fundraisers</h1>
              <p className="text-gray-600 mt-2">Support your university through meaningful contributions</p>
            </div>
            {user.role === 'admin' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4 sm:mt-0 rounded-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Fundraiser
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Create New Fundraiser</DialogTitle>
                    <DialogDescription>
                      Launch a new fundraising campaign for the alumni community
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Campaign Title</Label>
                      <Input
                        id="title"
                        placeholder="New Campus Library"
                        value={newFundraiser.title}
                        onChange={(e) => setNewFundraiser({...newFundraiser, title: e.target.value})}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal">Funding Goal ($)</Label>
                      <Input
                        id="goal"
                        type="number"
                        placeholder="100000"
                        value={newFundraiser.goal}
                        onChange={(e) => setNewFundraiser({...newFundraiser, goal: e.target.value})}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => setNewFundraiser({...newFundraiser, category: value})}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facilities">Facilities</SelectItem>
                          <SelectItem value="scholarships">Scholarships</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                          <SelectItem value="athletics">Athletics</SelectItem>
                          <SelectItem value="student-services">Student Services</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newFundraiser.endDate}
                        onChange={(e) => setNewFundraiser({...newFundraiser, endDate: e.target.value})}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the fundraiser goals and impact..."
                        value={newFundraiser.description}
                        onChange={(e) => setNewFundraiser({...newFundraiser, description: e.target.value})}
                        className="rounded-lg"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateFundraiser} className="w-full rounded-lg">
                      Create Fundraiser
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search fundraisers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
            <Button variant="outline" className="rounded-lg">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active Campaigns</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {/* Featured Fundraiser */}
            {filteredFundraisers.some(fundraiser => fundraiser.featured) && (
              <div className="mb-8">
                <h2 className="text-gray-900 mb-4">Featured Campaign</h2>
                {filteredFundraisers.filter(fundraiser => fundraiser.featured).map(fundraiser => (
                  <Card key={fundraiser.id} className="border-0 shadow-lg rounded-xl overflow-hidden">
                    <div className={`h-32 ${fundraiser.image} flex items-center justify-center`}>
                      <Badge className="bg-white text-gray-900">Featured</Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">{fundraiser.category}</Badge>
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              {getDaysRemaining(fundraiser.endDate)} days left
                            </Badge>
                          </div>
                          <h3 className="text-gray-900 mb-2">{fundraiser.title}</h3>
                          <p className="text-gray-600 mb-4">{fundraiser.description}</p>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">
                                  {formatCurrency(fundraiser.raised)} raised of {formatCurrency(fundraiser.goal)}
                                </span>
                                <span className="text-gray-600">
                                  {getProgressPercentage(fundraiser.raised, fundraiser.goal).toFixed(0)}%
                                </span>
                              </div>
                              <Progress 
                                value={getProgressPercentage(fundraiser.raised, fundraiser.goal)} 
                                className="h-3"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-gray-500">Donors</p>
                                <p className="text-gray-900">{fundraiser.donors}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Days Left</p>
                                <p className="text-gray-900">{getDaysRemaining(fundraiser.endDate)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 lg:mt-0 lg:ml-6">
                          <div className="space-y-4">
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={donationAmounts[fundraiser.id] || ''}
                                onChange={(e) => setDonationAmounts({
                                  ...donationAmounts, 
                                  [fundraiser.id]: parseInt(e.target.value) || 0
                                })}
                                className="rounded-lg"
                              />
                              <Button
                                onClick={() => handleDonate(fundraiser.id, donationAmounts[fundraiser.id] || 0)}
                                className="rounded-lg bg-green-600 hover:bg-green-700"
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                Donate
                              </Button>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="rounded-lg flex-1">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Regular Fundraisers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFundraisers.filter(fundraiser => !fundraiser.featured).map(fundraiser => (
                <Card key={fundraiser.id} className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-24 ${fundraiser.image}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{fundraiser.category}</Badge>
                      <div className="flex items-center text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{fundraiser.donors}</span>
                      </div>
                    </div>
                    <CardTitle className="text-gray-900">{fundraiser.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{fundraiser.description}</CardDescription>
                    
                    <div className="space-y-4 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">
                            {formatCurrency(fundraiser.raised)} raised
                          </span>
                          <span className="text-gray-600">
                            {getProgressPercentage(fundraiser.raised, fundraiser.goal).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={getProgressPercentage(fundraiser.raised, fundraiser.goal)} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          <span>Goal: {formatCurrency(fundraiser.goal)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{getDaysRemaining(fundraiser.endDate)} days left</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={donationAmounts[fundraiser.id] || ''}
                        onChange={(e) => setDonationAmounts({
                          ...donationAmounts, 
                          [fundraiser.id]: parseInt(e.target.value) || 0
                        })}
                        className="rounded-lg flex-1"
                      />
                      <Button
                        onClick={() => handleDonate(fundraiser.id, donationAmounts[fundraiser.id] || 0)}
                        className="rounded-lg bg-green-600 hover:bg-green-700"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedFundraisers.map(fundraiser => (
                <Card key={fundraiser.id} className="border-0 shadow-md rounded-xl opacity-90">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {fundraiser.category}
                      </Badge>
                      <Badge className="bg-green-600">Completed</Badge>
                    </div>
                    <CardTitle className="text-gray-900">{fundraiser.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{fundraiser.description}</CardDescription>
                    
                    <div className="space-y-4 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">
                            {formatCurrency(fundraiser.raised)} raised
                          </span>
                          <span className="text-green-600">
                            {getProgressPercentage(fundraiser.raised, fundraiser.goal).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={getProgressPercentage(fundraiser.raised, fundraiser.goal)} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{fundraiser.donors} donors</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span>Goal exceeded by {formatCurrency(fundraiser.raised - fundraiser.goal)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" disabled className="w-full rounded-lg">
                      Campaign Completed
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Impact Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">Total Raised</p>
              <p className="text-green-600">$2.1M</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Active Donors</p>
              <p className="text-blue-600">391</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-gray-600">Campaigns</p>
              <p className="text-purple-600">6 Active</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-gray-600">Success Rate</p>
              <p className="text-orange-600">94%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}