'use client';

import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

const CONSENT_KEY = 'mcm_consent_given';

export default function ConsentGate() {
  const { isConsented, actions } = useAppStore();
  const [micConsent, setMicConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    if (storedConsent === 'true') {
      actions.setConsented(true);
    } else {
      setShowDialog(true);
    }
  }, [actions]);

  const handleConsent = () => {
    if (micConsent && dataConsent) {
      localStorage.setItem(CONSENT_KEY, 'true');
      actions.setConsented(true);
      setShowDialog(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zgoda na korzystanie z MeCloneMe</DialogTitle>
          <DialogDescription>
            Aby korzystać z pokoju klonowania, musisz wyrazić zgodę na poniższe warunki.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="mic-consent" checked={micConsent} onCheckedChange={(checked) => setMicConsent(!!checked)} />
            <label htmlFor="mic-consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Zgadzam się na użycie mikrofonu.
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="data-consent" checked={dataConsent} onCheckedChange={(checked) => setDataConsent(!!checked)} />
            <label htmlFor="data-consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Zgadzam się na przetwarzanie danych głosowych (tylko lokalnie).
            </label>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Krótkie wideo (3s) z informacją o przetwarzaniu danych:</p>
            <video src="/path/to/your/3s-video.mp4" controls autoPlay muted loop className="w-full mt-2 rounded-md"></video>
            <p className="text-xs text-muted-foreground mt-1"> (Placeholder: W rzeczywistości byłoby tu krótkie wideo informacyjne)</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleConsent} disabled={!micConsent || !dataConsent}>
            Rozumiem i akceptuję
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
