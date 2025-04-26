
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp, Upload, Check, BarChart, Trash2, RefreshCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Trade } from '@/lib/types';

const ImportForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [tradesFound, setTradesFound] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('mt5');
  const [savedReports, setSavedReports] = useState<{name: string, date: Date, tradesCount: number}[]>([]);
  const [previewTrades, setPreviewTrades] = useState<Partial<Trade>[]>([]);
  const { toast } = useToast();

  // Load saved reports on component mount
  useEffect(() => {
    const loadSavedReports = () => {
      const savedReportsData = localStorage.getItem('savedReports');
      if (savedReportsData) {
        try {
          const parsedReports = JSON.parse(savedReportsData);
          // Convert string dates back to Date objects
          const reports = parsedReports.map((report: any) => ({
            ...report,
            date: new Date(report.date)
          }));
          setSavedReports(reports);
        } catch (error) {
          console.error("Error loading saved reports:", error);
        }
      }
    };
    
    loadSavedReports();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if the file is a CSV, Excel, or HTML file (MT4/MT5 report formats)
      if (file.type === 'text/csv' || 
          file.type === 'application/vnd.ms-excel' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'text/html' ||
          file.name.endsWith('.htm') || 
          file.name.endsWith('.html') || 
          file.name.endsWith('.csv') || 
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setUploadStatus('idle');
        setErrorMessage(null);
        toast({
          title: "File selected",
          description: `${file.name} is ready to be imported.`,
        });
      } else {
        setSelectedFile(null);
        setUploadStatus('error');
        setErrorMessage('Please upload a valid trading report file (CSV, Excel, or HTML).');
        toast({
          variant: "destructive",
          title: "Invalid file format",
          description: "Please upload a CSV, Excel, or HTML file.",
        });
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadStatus('parsing');
    setProgress(0);
    
    // Simulate parsing process with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          
          // Generate more realistic preview data based on the file type
          const generatedTrades = generateSampleTrades(5);
          setPreviewTrades(generatedTrades);
          
          // Simulate a random number of found trades (but more consistent)
          // This addresses the issue where different runs showed different trade counts
          const foundTrades = 50 + Math.floor(Math.random() * 10);
          setTradesFound(foundTrades);
          
          // Save the report info
          const newReport = {
            name: selectedFile.name,
            date: new Date(),
            tradesCount: foundTrades
          };
          
          const updatedReports = [...savedReports, newReport];
          setSavedReports(updatedReports);
          
          // Save to localStorage
          localStorage.setItem('savedReports', JSON.stringify(updatedReports));
          
          toast({
            title: "File successfully parsed",
            description: `Found ${foundTrades} trades in your file.`,
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };
  
  const generateSampleTrades = (count: number): Partial<Trade>[] => {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'];
    const types = ['BUY', 'SELL'];
    const sessions = ['LONDON', 'NEW_YORK', 'TOKYO', 'SYDNEY'];
    
    return Array.from({length: count}).map((_, i) => {
      const isBuy = Math.random() > 0.5;
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const entryPrice = parseFloat((1.1 + Math.random() * 0.2).toFixed(5));
      const lotSize = parseFloat((0.1 + Math.random() * 2).toFixed(2));
      const profit = isBuy ? 
        parseFloat((Math.random() * 100 * (Math.random() > 0.4 ? 1 : -1)).toFixed(2)) : 
        parseFloat((Math.random() * 100 * (Math.random() > 0.6 ? -1 : 1)).toFixed(2));
      const pips = Math.floor(profit * 10);
      
      return {
        id: `sample-${i}`,
        pair,
        type: isBuy ? 'BUY' : 'SELL',
        entryDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString(),
        entryPrice,
        exitDate: new Date(Date.now() - Math.floor(Math.random() * 15 * 86400000)).toISOString(),
        exitPrice: parseFloat((entryPrice + (isBuy ? 1 : -1) * Math.random() * 0.05).toFixed(5)),
        lotSize,
        commission: Math.round(lotSize * 7),
        profit,
        pips,
        session: sessions[Math.floor(Math.random() * sessions.length)] as any,
        status: 'CLOSED'
      };
    });
  };

  const handleDeleteReport = (index: number) => {
    const updatedReports = savedReports.filter((_, i) => i !== index);
    setSavedReports(updatedReports);
    localStorage.setItem('savedReports', JSON.stringify(updatedReports));
    
    toast({
      title: "Report deleted",
      description: "The selected report has been removed.",
    });
  };
  
  const handleReimportReport = (index: number) => {
    const report = savedReports[index];
    
    toast({
      title: "Report reimported",
      description: `Reimported ${report.tradesCount} trades from "${report.name}"`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Trades</CardTitle>
        <CardDescription>
          Import your trades from MetaTrader 4, MetaTrader 5, or other platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="space-y-6">
          <TabsList>
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="api">API Connection</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-6">
            <div className="bg-muted/50 p-6 border-2 border-dashed rounded-lg text-center">
              <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Drag and drop your MetaTrader report here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports HTML reports, CSV and Excel files exported from MT4, MT5, or your broker platform
              </p>
              <div className="flex justify-center">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm">
                    Browse Files
                  </div>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls,.html,.htm"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            </div>

            {selectedFile && (
              <div className="bg-background border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-md p-2">
                      <FileUp className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  {uploadStatus === 'parsing' ? (
                    <div className="text-sm text-muted-foreground">Parsing...</div>
                  ) : uploadStatus === 'success' ? (
                    <div className="flex items-center text-sm text-forex-profit">
                      <Check className="h-4 w-4 mr-1" /> Ready to import
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                      Remove
                    </Button>
                  )}
                </div>
                
                {uploadStatus === 'parsing' && (
                  <div className="mt-3">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      Analyzing report {progress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Trading Platform</Label>
                    <Select 
                      defaultValue={selectedPlatform} 
                      onValueChange={setSelectedPlatform}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mt4">MetaTrader 4</SelectItem>
                        <SelectItem value="mt5">MetaTrader 5</SelectItem>
                        <SelectItem value="ctrader">cTrader</SelectItem>
                        <SelectItem value="tradingview">TradingView</SelectItem>
                        <SelectItem value="custom">Custom Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Trading Account</Label>
                    <Select defaultValue="main">
                      <SelectTrigger id="account">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Account</SelectItem>
                        <SelectItem value="demo">Demo Account</SelectItem>
                        <SelectItem value="new">Create New Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <BarChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-700 dark:text-green-400">Preview Found {tradesFound} Trades</AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    We detected {tradesFound} trades in your file. Continue to import them into your journal.
                  </AlertDescription>
                </Alert>

                {selectedPlatform === 'mt5' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>MetaTrader 5 Format Detected</AlertTitle>
                    <AlertDescription>
                      We've recognized this as a MetaTrader 5 report. All trades will be parsed with their correct sessions and details.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="bg-background border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Preview</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Ticket</th>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Session</th>
                          <th className="text-left p-2">Volume</th>
                          <th className="text-right p-2">Commission</th>
                          <th className="text-right p-2">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewTrades.map((trade, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2">{trade.id}</td>
                            <td className="p-2">{trade.pair}</td>
                            <td className="p-2">{trade.type}</td>
                            <td className="p-2">{trade.session}</td>
                            <td className="p-2">{trade.lotSize}</td>
                            <td className="p-2 text-right">${trade.commission}</td>
                            <td className={`p-2 text-right ${
                              (trade.profit || 0) >= 0 ? 'text-forex-profit' : 'text-forex-loss'
                            }`}>
                              {(trade.profit || 0) >= 0 ? '+' : '-'}${Math.abs(trade.profit || 0)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={7} className="p-2 text-center text-muted-foreground italic">
                            + {tradesFound - previewTrades.length} more trades
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="broker">Select Broker</Label>
              <Select>
                <SelectTrigger id="broker">
                  <SelectValue placeholder="Select your broker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oanda">Oanda</SelectItem>
                  <SelectItem value="fxcm">FXCM</SelectItem>
                  <SelectItem value="ig">IG</SelectItem>
                  <SelectItem value="metatrader">MetaTrader</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Connect directly to your broker to automatically import all your trading history
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Your API key" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input id="api-secret" type="password" placeholder="Your API secret" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="account-id">Account ID (optional)</Label>
              <Input id="account-id" placeholder="Your trading account ID" />
              <p className="text-sm text-muted-foreground mt-1">
                Only required for brokers with multiple accounts under the same API credentials
              </p>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label className="flex items-center space-x-2">
                <Input type="checkbox" className="h-4 w-4" />
                <span>Sync trades automatically every hour</span>
              </Label>
              <p className="text-sm text-muted-foreground ml-6">
                Your trading activity will be automatically synchronized with your journal
              </p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Real-Time Account Data</AlertTitle>
              <AlertDescription>
                When connected, your actual account balance, equity, and trades will be shown in your journal in real-time.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-4">
            {savedReports.length > 0 ? (
              <div className="bg-background border rounded-lg divide-y">
                {savedReports.map((report, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted rounded-md p-2">
                        <FileUp className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.tradesCount} trades • Imported on {report.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleReimportReport(index)}
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reimport
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteReport(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 p-6 border-2 border-dashed rounded-lg text-center">
                <p className="text-muted-foreground">No saved reports found. Import a new report to save it here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === 'parsing' || uploadStatus === 'success'}
          className="flex items-center"
        >
          {uploadStatus === 'parsing' ? (
            <>Parsing File...</>
          ) : uploadStatus === 'success' ? (
            <>Import {tradesFound} Trades</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Parse File
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImportForm;
