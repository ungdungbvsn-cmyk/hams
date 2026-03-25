export const MovementList = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[60vh] text-center max-w-2xl mx-auto">
      <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/10 rotate-3 animate-pulse">
        <span className="text-4xl">📦</span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">Mạng lưới Phân bổ & Luân Chuyển</h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed font-medium">
        Quản lý theo dõi việc bàn giao, thu hồi và luân chuyển tài sản giữa các khoa phòng trong bệnh viện. 
        Module cao cấp này sẽ tích hợp Máy quét không dây.
      </p>
      <div className="px-8 py-3 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 font-bold tracking-widest text-sm uppercase shadow-sm">
        Đang được triển khai
      </div>
    </div>
  );
};
