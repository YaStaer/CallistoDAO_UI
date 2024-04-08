import React from "react";

const Modal = ({active, setActive, children}) => {
    return (
        <div className={active ? "modal active z-20" : "modal"} onClick={() => {setActive(false)}}>
            <div className={active ? "modal__content active" : "modal__content"} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

export default Modal;