export const CMInput = () => {
    return (
      <div>
        <input
          id="cmidTB"
          placeholder="Enter CMID"
        />
        <button onClick={selectNewCMID}>
          Use CMID
        </button>
      </div>
    );
}

function selectNewCMID() {
  alert((document.getElementById('cmidTB') as HTMLInputElement).value)
}