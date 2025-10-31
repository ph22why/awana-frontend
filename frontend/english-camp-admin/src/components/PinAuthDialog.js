import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { Lock } from '@mui/icons-material';

const PinAuthDialog = ({ open, onClose, onSuccess, requiredPin, title }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handlePinChange = (e) => {
    setPin(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === requiredPin) {
      setPin('');
      setError('');
      onSuccess();
    } else {
      setError('잘못된 PIN 번호입니다.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock />
          {title || '인증 필요'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            이 페이지에 접근하려면 PIN 번호를 입력하세요.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="PIN 번호"
            value={pin}
            onChange={handlePinChange}
            error={!!error}
            helperText={error}
            inputProps={{ maxLength: 4 }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained">
            확인
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PinAuthDialog; 