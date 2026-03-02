import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useNotifications } from '@/hooks/useNotifications';

export const useSocketNotifications = () => {
  const { socket } = useSocket();
  const { notify } = useNotifications();

  useEffect(() => {
    if (!socket) return;

    // استقبال رسائل جديدة
    socket.on('new_message', (data: {
      id: number;
      phoneNumber: string;
      messageText: string;
      messageType: 'SMS' | 'WhatsApp';
      direction: 'sent' | 'received';
      status: string;
    }) => {
      notify(
        'رسالة جديدة',
        `رسالة جديدة من ${data.phoneNumber}: ${data.messageText}`,
        'info',
        true
      );
    });

    // استقبال تحديثات حالة الرسائل
    socket.on('message_status_updated', (data: {
      messageId: number;
      status: 'sent' | 'delivered' | 'failed' | 'read';
    }) => {
      let statusText = '';
      switch (data.status) {
        case 'sent':
          statusText = 'تم الإرسال';
          break;
        case 'delivered':
          statusText = 'تم التسليم';
          break;
        case 'failed':
          statusText = 'فشل الإرسال';
          break;
        case 'read':
          statusText = 'تم القراءة';
          break;
      }

      notify(
        'تحديث حالة الرسالة',
        `الرسالة #${data.messageId}: ${statusText}`,
        data.status === 'failed' ? 'error' : 'success',
        false
      );
    });

    // استقبال إشعارات الحجوزات
    socket.on('booking_confirmed', (data: {
      bookingId: number;
      patientName: string;
      appointmentDate: string;
    }) => {
      notify(
        'تأكيد الحجز',
        `تم تأكيد حجز ${data.patientName} في ${data.appointmentDate}`,
        'success',
        true
      );
    });

    // استقبال إشعارات الحجوزات الملغاة
    socket.on('booking_cancelled', (data: {
      bookingId: number;
      patientName: string;
    }) => {
      notify(
        'إلغاء الحجز',
        `تم إلغاء حجز ${data.patientName}`,
        'warning',
        true
      );
    });

    // استقبال إشعارات الأخطاء
    socket.on('error', (error: string) => {
      notify(
        'خطأ',
        error,
        'error',
        true
      );
    });

    // تنظيف عند فك التثبيت
    return () => {
      socket.off('new_message');
      socket.off('message_status_updated');
      socket.off('booking_confirmed');
      socket.off('booking_cancelled');
      socket.off('error');
    };
  }, [socket, notify]);

  return socket;
};
