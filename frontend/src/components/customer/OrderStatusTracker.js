import React from 'react';

const OrderStatusTracker = ({ status, statusHistory = [] }) => {
  const steps = [
    { key: 'PENDING', label: 'Order Placed', icon: 'bi-receipt' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: 'bi-check2-circle' },
    { key: 'PREPARING', label: 'In Kitchen', icon: 'bi-fire' },
    { key: 'READY', label: 'Ready for Pickup', icon: 'bi-box-seam' },
    { key: 'COMPLETED', label: 'Completed', icon: 'bi-trophy' },
  ];

  const orderIndex = steps.findIndex((s) => s.key === status);
  const isCancelled = status === 'CANCELLED';
  const isRejected = status === 'REJECTED';

  if (isCancelled || isRejected) {
    return (
      <div className={`alert ${isCancelled ? 'alert-secondary' : 'alert-danger'} rounded-3 p-3 mb-4`}>
        <div className="d-flex align-items-center gap-2">
          <i className={`bi ${isCancelled ? 'bi-x-circle' : 'bi-slash-circle'} fs-4`}></i>
          <div>
            <h6 className="mb-0 fw-bold">
              {isCancelled ? 'Order Cancelled' : 'Order Declined / Rejected'}
            </h6>
            <small className="text-muted">
              {isCancelled
                ? 'This pre-order was cancelled and any reserved items have been restored to available inventory.'
                : 'The kitchen was unable to accept this order at this time.'}
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="bb-tracker">
        {steps.map((step, idx) => {
          const isCompleted = orderIndex > idx;
          const isActive = orderIndex === idx;

          return (
            <div
              key={step.key}
              className={`bb-tracker-step ${isCompleted ? 'completed' : ''} ${
                isActive ? 'active' : ''
              }`}
            >
              <div className="bb-tracker-circle">
                {isCompleted ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  <i className={`bi ${step.icon}`}></i>
                )}
              </div>
              <div className="bb-tracker-title">{step.label}</div>
            </div>
          );
        })}
      </div>

      {statusHistory.length > 0 && (
        <div className="bg-light p-3 rounded-3 border mt-3">
          <h6 className="fw-bold mb-2 small text-uppercase text-muted">Order Timeline</h6>
          <div className="timeline small">
            {statusHistory.map((item, idx) => (
              <div key={idx} className="d-flex justify-content-between text-muted border-bottom py-1">
                <span>
                  <strong className="text-dark me-2">{item.status}</strong>
                  {item.note && `– ${item.note}`}
                </span>
                <span className="text-nowrap ms-2">
                  {new Date(item.changedAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;
