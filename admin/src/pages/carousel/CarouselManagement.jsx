import React, { useState } from 'react';

import { Outlet } from 'react-router-dom';

export const CarouselManagement = () => {
 const [carousel, setCarousel] = useState([]); // Initialize state here

    return (
        <>
             <Outlet context={{ carousel, setCarousel }} />
        </>
    );
};
