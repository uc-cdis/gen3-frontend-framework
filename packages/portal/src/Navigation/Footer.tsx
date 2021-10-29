import React from 'react'


const Footer: React.FC<unknown> = () => {
    return (
        <div className="mt-auto">
        <div className="flex flex-col bg-blue-800 justify-center text-center p-4 text-white">
            <div>Site Home | Policies | Accessibility | FOIA | Support</div>
            <div>
                U.S. Department of Health and Human Services | National Institutes of
                Health | National Cancer Institute | USA.gov
            </div>
            <div>NIH... Turning Discovery Into Health ®</div>
        </div>
        </div>
    );
};

export default Footer;
