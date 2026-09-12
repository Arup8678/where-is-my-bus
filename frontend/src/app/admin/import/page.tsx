"use client";

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { previewExcelImport, confirmExcelImport, ExcelImportPreview, ExcelImportResult, ExcelPreviewRow } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

type Step = 'upload' | 'preview' | 'importing' | 'result';

export default function AdminImport() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExcelImportPreview | null>(null);
  const [result, setResult] = useState<ExcelImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'valid' | 'errors' | 'warnings'>('all');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast({ title: 'Invalid file', description: 'Only .xlsx and .xls files are allowed', variant: 'destructive' });
      return;
    }
    setFile(selectedFile);
    setLoading(true);
    setError(null);
    try {
      const data = await previewExcelImport(selectedFile);
      setPreview(data);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to parse Excel file');
      toast({ title: 'Import Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleImport = async () => {
    if (!preview) return;
    setStep('importing');
    setLoading(true);
    try {
      const validRows = preview.rows.filter(r => r.isValid);
      const data = await confirmExcelImport(validRows);
      setResult(data);
      setStep('result');
      toast({ title: 'Import completed!' });
    } catch (err: any) {
      setError(err.message);
      setStep('preview');
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setFilter('all');
  };

  // Filter rows
  const getFilteredRows = (): ExcelPreviewRow[] => {
    if (!preview) return [];
    switch (filter) {
      case 'valid': return preview.rows.filter(r => r.isValid && r.errors.length === 0);
      case 'errors': return preview.rows.filter(r => !r.isValid);
      case 'warnings': return preview.rows.filter(r => r.isValid && r.errors.length > 0);
      default: return preview.rows;
    }
  };

  // ─── Step 1: Upload ───────────────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Import Excel</h1>
          <p className="text-slate-500">Upload your bus timetable Excel file</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
                ${dragActive ? 'border-accent bg-accent/5' : 'border-slate-300 bg-slate-50 hover:border-accent/50 hover:bg-slate-100'}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-accent" />
                  <p className="text-slate-500">Parsing Excel file...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-700">Drag and drop an Excel file here</p>
                    <p className="text-sm text-slate-400 mt-1">or click to browse • .xlsx, .xls files only</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-700 mb-2">Expected Excel Format:</h3>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-slate-500">SL No</th>
                      <th className="text-left p-2 text-slate-500">Bus Name</th>
                      <th className="text-left p-2 text-slate-500">Route Name</th>
                      <th className="text-left p-2 text-slate-500">Stop Seq</th>
                      <th className="text-left p-2 text-slate-500">Stoppage</th>
                      <th className="text-left p-2 text-slate-500">Time</th>
                      <th className="text-left p-2 text-slate-500">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr className="border-b"><td className="p-2">1</td><td className="p-2">MAA SARADA</td><td className="p-2">Raipur–Howrah</td><td className="p-2">1</td><td className="p-2">Raipur</td><td className="p-2">03:40</td><td className="p-2">704703...</td></tr>
                    <tr className="border-b"><td className="p-2"></td><td className="p-2"></td><td className="p-2"></td><td className="p-2">2</td><td className="p-2">Motgoda</td><td className="p-2">03:50</td><td className="p-2"></td></tr>
                    <tr><td className="p-2"></td><td className="p-2"></td><td className="p-2"></td><td className="p-2">3</td><td className="p-2">Phulkusma</td><td className="p-2">04:00</td><td className="p-2"></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Step 2: Preview ──────────────────────────────────────────────────────────
  if (step === 'preview' && preview) {
    const filteredRows = getFilteredRows();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Preview Import</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" /> {file?.name}
            </p>
          </div>
          <Button variant="outline" onClick={reset}><ArrowLeft className="h-4 w-4 mr-2" /> Start Over</Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm cursor-pointer hover:ring-2 ring-accent" onClick={() => setFilter('all')}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{preview.totalRows}</p>
              <p className="text-xs text-slate-500">Total Rows</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm cursor-pointer hover:ring-2 ring-green-500" onClick={() => setFilter('valid')}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{preview.validRows}</p>
              <p className="text-xs text-slate-500">Valid</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm cursor-pointer hover:ring-2 ring-red-500" onClick={() => setFilter('errors')}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-red-600">{preview.errorRows}</p>
              <p className="text-xs text-slate-500">Errors</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm cursor-pointer hover:ring-2 ring-amber-500" onClick={() => setFilter('warnings')}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{preview.warningRows}</p>
              <p className="text-xs text-slate-500">Warnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Detected data summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Buses Found</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">{preview.buses.map(b => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Routes Found</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">{preview.routes.map(r => <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>)}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Stops Found</CardTitle></CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{preview.stops.length} unique stops</p>
            </CardContent>
          </Card>
        </div>

        {/* Data table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Showing {filteredRows.length} rows
                {filter !== 'all' && <Badge variant="outline" className="ml-2">{filter}</Badge>}
              </CardTitle>
              <div className="flex gap-1">
                {(['all', 'valid', 'errors', 'warnings'] as const).map(f => (
                  <Button key={f} size="sm" variant={filter === f ? 'default' : 'ghost'} className="text-xs h-7" onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead>Bus Name</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="w-12">Seq</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead className="w-16">Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow key={row.rowIndex} className={!row.isValid ? 'bg-red-50' : row.errors.length > 0 ? 'bg-amber-50' : ''}>
                      <TableCell className="text-xs text-slate-400">{row.rowIndex}</TableCell>
                      <TableCell className="text-sm">{row.busName || <span className="text-red-400">—</span>}</TableCell>
                      <TableCell className="text-sm">{row.routeName || <span className="text-red-400">—</span>}</TableCell>
                      <TableCell className="text-sm text-center">{row.stopSeq}</TableCell>
                      <TableCell className="text-sm font-medium">{row.stoppage || <span className="text-red-400">Missing</span>}</TableCell>
                      <TableCell className="text-sm font-mono">{row.time || <span className="text-red-400">—</span>}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <div className="space-y-1">
                            {row.errors.map((err, i) => (
                              <Badge key={i} variant={err.severity === 'error' ? 'destructive' : 'secondary'} className="text-[10px] block w-fit">
                                {err.message}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <div className="text-sm text-slate-500">
            <strong>{preview.validRows}</strong> rows will be imported, <strong>{preview.errorRows}</strong> will be skipped
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button 
              className="bg-accent hover:bg-accent/90" 
              onClick={handleImport}
              disabled={preview.validRows === 0}
            >
              Import {preview.validRows} Rows <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 3: Importing ────────────────────────────────────────────────────────
  if (step === 'importing') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Importing Data...</h2>
          <p className="text-slate-500">Please wait while we process your Excel file</p>
        </div>
      </div>
    );
  }

  // ─── Step 4: Result ───────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Import Complete!</h1>
          <p className="text-slate-500 mt-2">Your timetable data has been imported successfully</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-accent">{result.imported.buses}</p>
              <p className="text-xs text-slate-500">Buses</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-accent">{result.imported.routes}</p>
              <p className="text-xs text-slate-500">Routes</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-accent">{result.imported.stops}</p>
              <p className="text-xs text-slate-500">Stops</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-accent">{result.imported.tripStops}</p>
              <p className="text-xs text-slate-500">Trip Stops</p>
            </CardContent>
          </Card>
        </div>

        {result.skipped > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Skipped Rows</AlertTitle>
            <AlertDescription>{result.skipped} rows were skipped due to validation errors.</AlertDescription>
          </Alert>
        )}

        {result.errors.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Import Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {result.errors.map((err, i) => <li key={i} className="text-sm">{err}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={reset}>Import Another File</Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => window.location.href = '/admin/buses'}>
            View Imported Data
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
