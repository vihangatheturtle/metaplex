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
  console.log("Switching CMID");
  window.location.href = 'https://' + window.location.host + '?cmid=' + (document.getElementById('cmidTB') as HTMLInputElement).value;
}