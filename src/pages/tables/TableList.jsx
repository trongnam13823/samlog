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

/**
 * TableList - Trang danh sách các bàn chơi
 * Hiển thị danh sách bàn và nút tạo bàn mới
 */
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
      {/* === List: Danh sách các bàn chơi === */}
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
          <div className='text-muted-foreground fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
            Không có bàn nào
          </div>
        )}
      </ItemGroup>

      {/* === Footer: Nút tạo bàn mới === */}
      <FooterAction
        title='Thêm bàn thêm ghế'
        onClick={() => navigate('/create')}
      />
    </>
  );
}
