import { formatImg } from "@/utils/util";
function formatDate(value, fmt = Date.DATE) {
	if (!value) {
		return "";
	}
	return new Date(value).format(fmt);
}

export default {
	formatDate,
	formatImg
};
