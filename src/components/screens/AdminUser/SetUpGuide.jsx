import React from "react";

const SetupGuide = () => {
    return (
        <>
            <div className="p-3">
                <div className="card bg-whit border rounded-md px-4 py-2 ">
                    <div className="card-body">
                      <div>
                        <p className="text-black font-semibold text-[13px]">Setup progress</p>
                        <span className="text-[13px]">50%</span>
                      </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SetupGuide;