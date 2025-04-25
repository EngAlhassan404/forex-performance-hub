
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ImportForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if the file is a CSV or Excel file
      if (file.type === 'text/csv' || 
          file.type === 'application/vnd.ms-excel' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setSelectedFile(file);
        setUploadStatus('idle');
        setErrorMessage(null);
      } else {
        setSelectedFile(null);
        setUploadStatus('error');
        setErrorMessage('Please upload a CSV or Excel file.');
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadStatus('parsing');
    
    // Simulate parsing process
    setTimeout(() => {
      setUploadStatus('success');
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Trades</CardTitle>
        <CardDescription>
          Import your trades from external sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="space-y-6">
          <TabsList>
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="api">API Connection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-6">
            <div className="bg-muted/50 p-6 border-2 border-dashed rounded-lg text-center">
              <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Drag and drop your file here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports CSV and Excel files exported from MT4, MT5, or your broker
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
                    accept=".csv,.xlsx,.xls"
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
                    <div className="text-sm text-forex-profit">Ready to import</div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Trading Platform</Label>
                    <Select defaultValue="mt4">
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

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Preview Found 42 Trades</AlertTitle>
                  <AlertDescription>
                    We detected 42 trades in your file. Continue to import them into your journal.
                  </AlertDescription>
                </Alert>
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
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="Your API key" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-secret">API Secret</Label>
              <Input id="api-secret" type="password" placeholder="Your API secret" />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Secure Connection</AlertTitle>
              <AlertDescription>
                Your API credentials are securely encrypted and only used to sync your trading data.
              </AlertDescription>
            </Alert>
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
            <>Import Trades</>
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
