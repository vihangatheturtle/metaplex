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
  if ((document.getElementById('cmidTB') as HTMLInputElement).value !== '' && (document.getElementById('cmidTB') as HTMLInputElement).value !== undefined && (document.getElementById('cmidTB') as HTMLInputElement).value !== null && (document.getElementById('cmidTB') as HTMLInputElement).value.length == 44) {
    console.log("Switching CMID");
    window.location.href = 'https://' + window.location.host + '?cmid=' + (document.getElementById('cmidTB') as HTMLInputElement).value;
  } else {
    console.log("Invalid CMID");
  }
}