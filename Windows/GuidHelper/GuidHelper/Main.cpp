#include <iostream>

#include <winrt/Windows.Foundation.h>

using std::cout;
using std::endl;
using winrt::Windows::Foundation::GuidHelper;

int main()
{
	try
	{
		auto guid = GuidHelper::CreateNewGuid();

		auto hstr = winrt::to_hstring(guid);
		auto str = winrt::to_string(hstr);

		cout << "[WIN] " << str << endl;
	}
	catch (const winrt::hresult_error& e)
	{
		auto message = winrt::to_string(e.message());
		cout << "[FAIL] " << e.code() << ": " << message << endl;
	}
}
