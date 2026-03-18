import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { getRankColor } from '@/utils/getColor';
import {
  createGame,
  getGameInfo,
  getTableUsers,
  updateGameInfo,
} from '@/lib/database';
import { motion } from 'framer-motion';

export default function GameCreateCopyEdit() {
  const navigate = useNavigate();
  const { tableId, gameId, action } = useParams();

  // State cho tên ván chơi
  const [name, setName] = useState('');

  // State cho ghi chú từng thứ hạng
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    if (action === 'copy' || action === 'update') {
      const { name, rewards } = getGameInfo(tableId, gameId);
      setName(name);
      setRewards(rewards);
    } else {
      const users = getTableUsers(tableId);
      setRewards(users.map(() => ''));
    }
  }, []);

  // ===== handle change note =====
  const handleNoteChange = (i, value) => {
    setRewards((prev) =>
      prev.map((content, index) => (index === i ? value : content)),
    );
  };

  // ===== submit =====
  const handleSubmit = (e) => {
    e.preventDefault();

    if (action === 'copy') {
      const gameId = createGame(tableId, name, rewards);
      navigate(`/tables/${tableId}/games/${gameId}`, { replace: true });
    } else if (action === 'update') {
      updateGameInfo(tableId, gameId, name, rewards);
      navigate(-1, { replace: true });
    } else {
      const defaultName = name || 'Chơi xong rồi tính';
      const gameId = createGame(tableId, defaultName, rewards);
      navigate(`/tables/${tableId}/games/${gameId}`, { replace: true });
    }
  };

  const getTitle = () => {
    if (action === 'copy') {
      return 'Sao chép bát đũa';
    }
    if (action === 'update') {
      return 'Chỉnh sửa bát đũa';
    }
    return 'Thên bát thêm đũa';
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <FieldSet>
          <FieldLegend className='text-center text-lg font-semibold'>
            {getTitle()}
          </FieldLegend>

          <FieldDescription className='text-center text-sm'>
            Người không chơi là người thắng
          </FieldDescription>

          <FieldGroup className='mt-5'>
            <Field>
              <FieldLabel htmlFor='name'>Kèo gì đây các dân chơi?</FieldLabel>

              <Input
                className='h-11 text-base'
                type='text'
                id='name'
                autoComplete='off'
                placeholder='Chơi xong rồi tính...'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <FieldGroup className='mt-5 gap-5'>
            {rewards.map((content, i) => (
              <Field key={i} className='flex flex-row items-center gap-5'>
                <FieldLabel
                  htmlFor={i}
                  className={cn(
                    'flex h-11 min-w-[48px] flex-1 items-center justify-center rounded-lg text-base font-semibold',
                    getRankColor(i),
                  )}
                >
                  #{i + 1}
                </FieldLabel>

                <Input
                  className='h-11 flex-2 text-base'
                  type='text'
                  id={i}
                  autoComplete='off'
                  placeholder='+100, -50, trả tiền nước...'
                  value={content}
                  onChange={(e) => handleNoteChange(i, e.target.value)}
                />
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </motion.form>
      <FooterAction title='Ok luôn' onClick={handleSubmit} />
    </>
  );
}
