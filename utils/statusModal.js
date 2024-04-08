import React from "react";

const StatusModal = ({active, setActive, children}) => {
    return (
        <div className={active ? "status-modal active z-30" : "status-modal"} onClick={() => {setActive(false)}}>
            <div className={active ? "status-modal__content active" : "status-modal__content"}>
                {children}
            </div>
        </div>
    )
}

export default StatusModal;