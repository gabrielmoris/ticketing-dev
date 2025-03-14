import { useState } from "react";
import { useRequest } from "../../hooks/use-request";
import { useRouter } from "next/router";

const NewTicket = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: (ticket) => {
      router.push("/");
    },
  });

  const handleOnBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      setPrice("");
      return;
    }

    setPrice(value.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doRequest();
  };

  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label> Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label> Price</label>
          <input
            className="form-control"
            value={price}
            onBlur={handleOnBlur}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
