'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/useWebSocket';

export function ToastProvider() {
  const websocket = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'notification':
          showToast(message.data);
          break;
        
        case 'order_update':
          if (message.data.status === 'accepted') {
            toast.success('Auftrag bestätigt!', {
              description: 'Ihr Auftrag wurde von einem Fahrer angenommen.',
            });
          } else if (message.data.status === 'completed') {
            toast.success('Auftrag abgeschlossen!', {
              description: 'Ihr Transport wurde erfolgreich durchgeführt.',
            });
          }
          break;
        
        case 'offer_submitted':
          toast.info('Neues Angebot erhalten!', {
            description: `Ein Fahrer hat ein Angebot für €${message.data.price} abgegeben.`,
          });
          break;
        
        case 'offer_accepted':
          toast.success('Angebot akzeptiert!', {
            description: 'Sie haben ein Angebot angenommen. Der Fahrer wurde benachrichtigt.',
          });
          break;
        
        case 'driver_verified':
          toast.success('Fahrdienst verifiziert!', {
            description: `${message.data.companyName} wurde erfolgreich verifiziert.`,
          });
          break;
        
        case 'driver_rejected':
          toast.warning('Fahrdienst abgelehnt', {
            description: `Der Antrag von ${message.data.companyName} wurde abgelehnt.`,
          });
          break;
        
        default:
          console.log('Unhandled WebSocket message:', message);
      }
    },
  });

  // Global toast function
  useEffect(() => {
    window.showToast = showToast;
    return () => {
      delete window.showToast;
    };
  }, []);

  return null;
}

function showToast(data: {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const { type, title, message, duration, action } = data;
  
  switch (type) {
    case 'success':
      toast.success(title, { description: message, duration, action });
      break;
    case 'error':
      toast.error(title, { description: message, duration, action });
      break;
    case 'warning':
      toast.warning(title, { description: message, duration, action });
      break;
    case 'info':
    default:
      toast.info(title, { description: message, duration, action });
      break;
  }
}

// Notification hooks for different features
export function useMarketplaceNotifications() {
  const websocket = useWebSocket();

  const notifyNewOffer = (offer: { driverName: string; price: number }) => {
    toast.info('Neues Angebot erhalten!', {
      description: `${offer.driverName} bietet €${offer.price} für Ihren Auftrag.`,
      action: {
        label: 'Angebote ansehen',
        onClick: () => {
          // Navigate to marketplace offers
          window.location.href = '/marketplace';
        },
      },
    });
  };

  const notifyOrderAccepted = (driverName: string) => {
    toast.success('Auftrag bestätigt!', {
      description: `${driverName} hat Ihren Auftrag angenommen.`,
    });
  };

  const notifyOrderCompleted = () => {
    toast.success('Auftrag abgeschlossen!', {
      description: 'Ihr Transport wurde erfolgreich durchgeführt.',
      action: {
        label: 'Bewertung abgeben',
        onClick: () => {
          // Navigate to rating page
          console.log('Navigate to rating');
        },
      },
    });
  };

  return {
    notifyNewOffer,
    notifyOrderAccepted,
    notifyOrderCompleted,
  };
}

export function useDriverNotifications() {
  const websocket = useWebSocket();

  const notifyNewOrder = (orderDetails: {
    pickup: string;
    delivery: string;
    price: number;
  }) => {
    toast.info('Neuer Auftrag verfügbar!', {
      description: `${orderDetails.pickup} → ${orderDetails.delivery} für €${orderDetails.price}`,
      action: {
        label: 'Angebot abgeben',
        onClick: () => {
          // Navigate to offer submission
          console.log('Navigate to offer submission');
        },
      },
    });
  };

  const notifyOfferAccepted = (orderId: number) => {
    toast.success('Angebot angenommen!', {
      description: 'Ihr Angebot wurde vom Kunden angenommen.',
      action: {
        label: 'Auftragdetails',
        onClick: () => {
          // Navigate to order details
          console.log('Navigate to order details');
        },
      },
    });
  };

  return {
    notifyNewOrder,
    notifyOfferAccepted,
  };
}

export function useAdminNotifications() {
  const websocket = useWebSocket();

  const notifyNewDriverApplication = (companyName: string) => {
    toast.info('Neuer Fahrdienst-Antrag', {
      description: `${companyName} hat einen Verifizierungsantrag gestellt.`,
      action: {
        label: 'Antrag prüfen',
        onClick: () => {
          // Navigate to admin verification
          window.location.href = '/admin/driver-verification';
        },
      },
    });
  };

  return {
    notifyNewDriverApplication,
  };
}
