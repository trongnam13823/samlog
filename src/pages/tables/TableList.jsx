import FooterAction from '@/components/FooterAction';
import { ItemGroup } from '@/components/ui/item';
import { useNavigate } from 'react-router';
import TableItem from './TableItem';
import {
  deleteTable,
  getSwipeHintCount,
  getTableList,
  setSwipeHintCount,
} from '@/lib/database';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function TableList() {
  const navigate = useNavigate();
  const [data, setData] = useState(getTableList());
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  const onDelete = (index, name) => {
    if (confirm(`Xóa bàn "${name}"?`)) {
      deleteTable(index);
      setData(getTableList());
    }
  };

  useEffect(() => {
    const data = getSwipeHintCount();
    const count = data.tableItem;
    if (count < 1) {
      setShowSwipeHint(true);
      setSwipeHintCount({
        ...data,
        tableItem: count + 1,
      });
    }
  }, []);

  return (
    <>
      {/* === List === */}
      <motion.div
        initial='hidden'
        animate='show'
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.06,
            },
          },
        }}
      >
        <ItemGroup className='gap-5'>
          {data.length > 0 ? (
            data
              .map((item, index) => (
                <TableItem
                  key={item.createdAt}
                  index={index}
                  showSwipeHint={showSwipeHint && index === data.length - 1}
                  {...item}
                  onDelete={onDelete}
                />
              ))
              .reverse()
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-muted-foreground fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'
            >
              Không có bàn nào
            </motion.div>
          )}
        </ItemGroup>
      </motion.div>

      {/* === Footer === */}
      <FooterAction
        title='Thêm bàn thêm ghế'
        onClick={() => navigate('/create')}
      />
    </>
  );
}
