import React from 'react';
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Download, Print, ContentCopy, Close, Check } from '@mui/icons-material';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const QRCodeDisplay = ({ 
  data, 
  title = 'QR Code', 
  subtitle, 
  size = 200,
  onClose,
  showActions = true 
}) => {
  const [copied, setCopied] = React.useState(false);
  const [printDialog, setPrintDialog] = React.useState(false);

  const handleDownload = () => {
    const canvas = document.querySelector('#qrcode-canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handlePrint = () => setPrintDialog(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data)).then(() => setCopied(true));
    setTimeout(() => setCopied(false), 2000);
  };

  const qrValue = typeof data === 'string' ? data : JSON.stringify(data);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" gutterBottom>{subtitle}</Typography>}
      
      <Box sx={{ 
        display: 'inline-flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 1
      }}>
        <QRCode
          id="qrcode-canvas"
          value={qrValue}
          size={size}
          level="M"
          includeMargin={true}
          renderAs="canvas"
        />
        
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="outlined" startIcon={<Download />} onClick={handleDownload} size="small">Download</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint} size="small">Print</Button>
            <Button variant="outlined" startIcon={copied ? <Check /> : <ContentCopy />} onClick={handleCopy} size="small">
              {copied ? 'Copied!' : 'Copy Data'}
            </Button>
          </Box>
        )}
      </Box>

      <Dialog open={printDialog} onClose={() => setPrintDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Print QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <QRCode value={qrValue} size={300} level="M" includeMargin={true} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {subtitle || title}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialog(false)}>Cancel</Button>
          <Button onClick={() => { window.print(); setPrintDialog(false); }}>Print</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}>
        <div>Copied to clipboard!</div>
      </Snackbar>
    </Box>
  );
};

export default QRCodeDisplay;