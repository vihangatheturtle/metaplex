export async function verifyKey(license: string) {
    var request = await fetch(`https://api.hyper.co/v6/licenses/${license}`, {
        headers: {
            Authorization: 'Bearer pk_Cgp2EJHcQLjHFLKvL5sdFFPeKj501zXU'
        }
    });

    var res = await request.text();

    if (res !== 'Not Found') {
        try {
            var data = JSON.parse(res);
            if (data.status === 'active') {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log("Hyper verification error: " + e);
            return false;
        }
    }
}