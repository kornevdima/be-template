import React from 'react';
import {
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

export default function Selector({
  value,
  values,
  onChange,
  onClick,
  btnText,
  id,
  label,
}) {
  return (
    <Container
      sx={{
        display: 'flex',
        paddingBottom: '20px',
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="topic-select-label">{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          label={label}
          value={value}
          onChange={onChange}
        >
          <MenuItem value={''}>None</MenuItem>
          {values.map((value, index) => (
            <MenuItem key={index} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={onClick}
        sx={{
          marginLeft: '10px',
        }}
      >
        {btnText}
      </Button>
    </Container>
  );
}
