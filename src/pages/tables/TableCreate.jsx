import { useState } from 'react';
import FooterAction from '@/components/FooterAction';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createTable } from '@/lib/database';
import { useNavigate } from 'react-router';

/**
 * TableCreate - Trang tạo bàn chơi mới
 * Form nhập tên người chơi và preview
 */
export default function TableCreate() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  // Parse input thành danh sách người chơi (viết hoa chữ đầu)
  const players = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());

  // Validate: cần 2-5 người chơi
  const isInValid = players.length < 2 || players.length > 5;

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tableIndex = createTable(players);
    navigate(`/tables/${tableIndex}/games`, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className='flex h-full flex-col'>
      <FieldSet>
        <FieldLegend className='text-center text-lg font-semibold'>
          Thêm bàn thêm ghế
        </FieldLegend>

        <FieldDescription className='text-center text-sm'>
          Người không chơi là người thắng
        </FieldDescription>

        {/* === Input: Tên người chơi === */}
        <FieldGroup className='mt-5'>
          <Field>
            <FieldLabel htmlFor='players'>Tên các dân chơi</FieldLabel>

            <Input
              className='h-11 text-base'
              type='text'
              id='players'
              autoComplete='off'
              placeholder='Nam Quang Hưng...'
              value={value}
              onChange={handleChange}
            />

            {/* Hint validate */}
            <FieldDescription
              className={cn(
                'mt-1',
                isInValid && players.length > 0 && 'text-destructive',
              )}
            >
              Nhập 2 - 5 tên, cách nhau bằng dấu cách
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* === Preview: Badge tên người chơi === */}
      <div className='mt-4 flex min-h-[40px] flex-wrap gap-2'>
        {players.map((name, index) => (
          <Badge key={index} className='px-3 py-1 text-sm' variant='secondary'>
            {name}
          </Badge>
        ))}
      </div>

      {/* Spacer đẩy footer xuống */}
      <div className='flex-1' />

      {/* === Footer: Nút submit === */}
      <FooterAction
        title={isInValid ? 'Cần 2 - 5 người chơi' : 'Ok luôn'}
        onClick={handleSubmit}
        disabled={isInValid}
      />
    </form>
  );
}
