import { useState } from "react";
import api from "../api";

export const AddCarousel = () => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");

    const submit = async (e) => {
        e.preventDefault();

        const fd = new FormData();
        fd.append("image", image);
        fd.append("title", title);
        fd.append("link", link);

        await api.post("/carousel", fd);
        alert("Carousel added");
    };

    return (
        <form onSubmit={submit} className="customer-form">
            <input type="file" onChange={e => setImage(e.target.files[0])} required />
            <input placeholder="Title (optional)" onChange={e => setTitle(e.target.value)} />
            <input placeholder="Link (optional)" onChange={e => setLink(e.target.value)} />
            <button>Add</button>
        </form>
    );
};
