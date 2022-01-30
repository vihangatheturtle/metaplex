export const CMInput = () => {
    return (
      <div>
        <input
          placeholder="Enter CMID"
        />
        <button onClick={selectNewCMID}>
          Use CMID
        </button>
      </div>
    );
}

function selectNewCMID() {
  alert(0)
}