import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle, Search, Mail, MessageSquare, Phone, FileText, Book } from "lucide-react";

export default function HelpPage() {
  const faqItems = [
    {
      question: "How do I add stocks to my watchlist?",
      answer: "You can add stocks to your watchlist by visiting the stock detail page and clicking the 'Add to Watchlist' button, or from the Discover page by clicking the star icon next to any stock."
    },
    {
      question: "How do I create a price alert?",
      answer: "Navigate to the stock detail page, scroll to the alerts section, enter your target price, and click 'Create Alert'. You can manage all your alerts from the Alerts page."
    },
    {
      question: "Can I simulate trading without real money?",
      answer: "Yes! iTrade provides a virtual balance of $10,000 for new accounts so you can practice trading without risking real money."
    },
    {
      question: "How do I deposit funds into my account?",
      answer: "Go to the Portfolio page and click on 'Deposit Funds'. You can then select from various payment methods including credit/debit cards and bank transfers."
    },
    {
      question: "How accurate is the market data?",
      answer: "Our market data is sourced from professional financial data providers with a slight delay (15 minutes) for standard accounts. Premium accounts receive real-time data."
    },
    {
      question: "Can I export my trading history?",
      answer: "Yes, you can export your trading history as a CSV file. Go to Portfolio > Trading History and click the 'Export' button in the top right corner."
    },
    {
      question: "How do I update my account information?",
      answer: "You can update your account information in the Settings page under the Account tab."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, iTrade is available as a mobile app for both iOS and Android devices. You can download it from the respective app stores."
    },
  ];

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-white/60">Find answers to common questions and learn how to use iTrade.</p>
      </div>
      
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
          <Input 
            placeholder="Search for help..." 
            className="pl-10 bg-black/30 border-white/20"
          />
        </div>
      </div>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-4xl">
          <TabsTrigger value="faq" className="flex items-center justify-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center justify-center">
            <Book className="mr-2 h-4 w-4" />
            <span>Guides</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center justify-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Contact</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to the most common questions about iTrade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-white/70">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <Card className="glass">
            <CardHeader>
              <CardTitle>User Guides</CardTitle>
              <CardDescription>
                Step-by-step guides to help you get the most out of iTrade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg futuristic-gradient flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Getting Started</h3>
                  </div>
                  <p className="text-sm text-white/60">Learn the basics of navigating and using iTrade</p>
                </div>
                
                <div className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg futuristic-gradient flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Trading Basics</h3>
                  </div>
                  <p className="text-sm text-white/60">Understanding market orders, limit orders, and trading strategies</p>
                </div>
                
                <div className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg futuristic-gradient flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Technical Analysis</h3>
                  </div>
                  <p className="text-sm text-white/60">How to use charts and indicators to analyze stocks</p>
                </div>
                
                <div className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg futuristic-gradient flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Portfolio Management</h3>
                  </div>
                  <p className="text-sm text-white/60">Tips for building and managing a diversified portfolio</p>
                </div>
                
                <div className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg futuristic-gradient flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Risk Management</h3>
                  </div>
                  <p className="text-sm text-white/60">Strategies to protect your investments and manage risk</p>
                </div>
                
                <div className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg futuristic-gradient flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Advanced Features</h3>
                  </div>
                  <p className="text-sm text-white/60">Exploring advanced tools and features of iTrade Pro</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="bg-black/30 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      className="bg-black/30 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="subject">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      className="bg-black/30 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Describe your issue in detail"
                      className="w-full rounded-md bg-black/30 border border-white/20 p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>
                  <Button className="w-full cyberpunk-button">Send Message</Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Other Ways to Reach Us</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mr-3">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Email</h4>
                          <p className="text-sm text-white/60">support@itrade.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mr-3">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Phone</h4>
                          <p className="text-sm text-white/60">+1 (800) 555-0123</p>
                          <p className="text-xs text-white/40">Monday-Friday, 9am-5pm EST</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mr-3">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Live Chat</h4>
                          <p className="text-sm text-white/60">Available 24/7 for premium members</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Response Times</h3>
                    <p className="text-sm text-white/60 mb-4">We strive to respond to all inquiries within 24 hours. Premium members receive priority support.</p>
                    <Button variant="outline" className="w-full bg-transparent border-white/20 text-primary">
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}